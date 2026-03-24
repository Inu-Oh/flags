from csv import reader, DictWriter
from datetime import datetime
from random import choice

from django.contrib.auth.mixins import PermissionRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect, render
from django.views.generic.edit import CreateView

from .forms import PopulateDbForm
from .models import Country


def index(request):
    return render(request, 'index.html')


def check_sess(request):
    if 'quiz' in request.session:
        quiz = True
        quiz_length = len(request.session['quiz_list'])
        score = request.session['score']
    else:
        quiz = quiz_length = score = False
    
    return JsonResponse({ 'quiz': quiz, 'flagCount': quiz_length, 'score': score })


def  check_sess2(request):
    if 'quiz' in request.session:
        return JsonResponse({'quiz': True})
    else:
        request.session['quiz'] = "flag"
        return JsonResponse({'quiz': False})


# Javascript API views
def get_flag_id(request):
    if not 'quiz_list' in request.session:
        quiz_list = list(Country.objects.all().values_list('id', flat=True).distinct())
        
    else:
        quiz_list = request.session['quiz_list']

    next_id = choice(quiz_list)
    quiz_list.remove(next_id)
    request.session['quiz_list'] = quiz_list
    request.session['flag_id'] = next_id
    quiz_length = len(quiz_list)

    return JsonResponse({
        'flagCount': quiz_length,
        'currId': next_id
    })



def get_flag_q(request):
    pk = request.session['flag_id']
    country = Country.objects.get(id=pk)
    # Change domain for production
    flag = "http://127.0.0.1:8000/static/images/" + str(country.country_code) + ".png"
    hint = str(country.hint) if country.hint is not None else ""

    return JsonResponse({ 'flag': flag, 'hint': hint })


def get_flag_ans(request):
    pk = request.session['flag_id']
    country = Country.objects.get(id=pk)
    country_name = country.country
    return JsonResponse({'country': country_name})


def get_score(request):
    score = request.session['score']
    return JsonResponse({'score': score})


def update_score(request, score):
    if 'score' in request.session:
        if int(score) == 1:
            request.session['score'] += 1
    else:
        request.session['score'] = 1
    
    new_score = request.session['score']

    return JsonResponse({'new_score': new_score})


def reset_score(request):
    request.session['score'] = 0

    return HttpResponse(status=204)


def set_list(request):
    # Set list of question IDs in session for quiz progress & get question count
    quiz_list = list(Country.objects.all().values_list('id', flat=True).distinct())
    request.session['quiz_list'] = quiz_list
    quiz_length = len(quiz_list)
    return JsonResponse({'flagCount': quiz_length})


# Superuser view for pupulating DB - edit import_data.csv then submit
class PopulateDbView(PermissionRequiredMixin, CreateView):
    permission_required = [
        'flags.add_country',
        'flags.change_country',
        'flats.delete_country'
    ]
    template_name = 'flags/populate_db.html'

    # TODO review get method for unneeded variables
    def get(self, request):
        if not request.user.is_superuser:
            return redirect('index')

        try:
            db = Country.objects.all()
        except:
            db = False

        # Create researchable dictionary of existing DB objects
        db_data = []
        if db:
            for obj in db:
                country = {}
                country['country'] = obj.country
                country['capital'] = obj.capital
                country['hint'] = obj.hint if obj.hint else ""
                country['cc'] = obj.country_code
                country['pk'] = obj.pk
                db_data.append(country)
        
        # Review CSV data for errors and compare with existing DB objects
        new, edits, unchanged = 0, 0, 0
        country_dict, cc_dict, pk_dict = {}, {}, {}
        bad_pks =[]
        try:
            with open('import_data.csv') as csv:
                data_reader = reader(csv)
                next(data_reader)
                for row in data_reader:
                    # Validate data quality
                    try:
                        country_dict[row[0]] = country_dict.get(row[0], 0) + 1
                        _ = row[1]
                        cc_dict[row[2]] = cc_dict.get(row[2], 0) + 1
                    except IndexError:
                        raise ValueError
                    try:
                        pk_str = row[4]
                    except IndexError:
                        pk_str = False
                    if pk_str:
                        try:
                            pk = int(pk_str)
                            pk_dict[pk] = pk_dict.get(pk, 0) + 1
                        except:
                            raise TypeError
                    else:
                        pk = False
                        new += 1
                        new_country = {}
                        new_country['country'] = row[0]
                        new_country['capital'] = row[1]
                        new_country['cc'] = row[2]
                        try:
                            new_country['hint'] = row[3]
                        except:
                            pass
                        new_country['status'] = 'new'
                        db_data.append(new_country)
                    # Check CSV data against existing objects saved in DB
                    if pk:
                        if any((country := data).get('pk') == pk for data in db_data):
                            if (
                                country['country'] == row[0] 
                                and country['capital'] == row[1]
                                and country['cc'] == row[2] 
                                and country['hint'] == row[3]
                            ):
                                country['status'] = 'unchanged'
                                unchanged += 1
                            else:
                                country['status'] = 'edited'
                                edits += 1
                                if country['country'] != row[0]:
                                    country['country'] += " => "+row[0]
                                if country['capital'] != row[1]:
                                    country['capital'] += " => "+row[1]
                                if country['cc'] != row[2]:
                                    country['cc'] += " => "+row[2]
                                if country['hint'] != row[3]:
                                    country['hint'] += " => "+row[3]
                        else: 
                            bad_pks.append(pk)                    

        except (ValueError, TypeError, ObjectDoesNotExist):
            msg = "<h3>Error</h3>"
            msg += "Review data.csv and fix errors then refresh this page. "
            msg += "This error is the result of missing, misplaced or inaccuarate data. "
            msg += "If you previously cleared the database you may need to delete "
            msg += "former primary keys from the pk column."
            return render(request, self.template_name, { 'message': msg })

        # Present error if CSV includes bad pk values
        if bad_pks:
            msg = "<h3>Error</h3>"
            msg += "Error the import CSV includes primary keys that are not in the database."
            msg += f"<br>List of bad keys: {bad_pks}<br>Correct the CSV then refresh page."
            return render(request, self.template_name, { 'message': msg })

        # Check for duplicates
        dup_country = [country for country, count in country_dict.items() if count > 1]
        dup_cc = [cc for cc, count in cc_dict.items() if count > 1]
        dup_pk = [pk for pk, count in pk_dict.items() if count > 1]
        print(dup_country)

        if len(dup_country) > 0 or len(dup_cc) > 0 or len(dup_pk):
            msg = "<h3>Error</h3>"
            msg += "The CSV import file includes duplicate country names or codes or "
            msg += "primary keys. Correct any errors before proceeding.<br><br>"
            msg += f"Duplicate countries: {dup_country}<br>Duplicate country codes: "
            msg += f"{dup_cc}<br>Duplicate primary keys: {dup_pk}"

            return render(request, self.template_name, {'message': msg})

        # Get data on deleted items
        csv_pk_list = [pk for pk, count in pk_dict.items()]
        db_pk_list = Country.objects.all().values_list('id', flat=True)
        deletions = []
        for pk in db_pk_list:
            if pk not in csv_pk_list:
                country = Country.objects.get(pk=pk)
                deletions.append(
                    "<b>" + country.country + "</b> " + country.country_code.upper() + 
                    " " + country.capital + " " + str(country.pk)
                )

        # Prepare all data for context, form and session if validation is successful
        msg = "<h3>Update Summary</h3>"
        msg += f"New entries: {new}<br>Edited entries: {edits}<br>Unchanged entries: "
        msg += f"{unchanged}<br>Deleted entries: {len(deletions)}"
        if deletions:
            msg += "<br><br>The following countries will be deleted from the database:"
            for country in deletions:
                msg += f"<br>{country}"
        
        form = PopulateDbForm()
        context = { 'form': form, 'message': msg, 'db': db_data }

        request.session['deletions'] = deletions if deletions else []
        
        return render(request, self.template_name, context)
    
    def post(self, request):
        if not request.user.is_superuser:
            return redirect('index')
        
        form = PopulateDbForm(request.POST)

        if not form.is_valid():
            return render(request, self.template_name, { 'form': form })

        # TODO check database before creating new object
        # TODO CHANGE logic for deletions since deletions were change din get

        with open('import_data.csv') as csv:
            data_reader = reader(csv)
            next(data_reader)
            for row in data_reader:
                try:
                    pk = int(row[4])
                except:
                    pk = False
                # pk value was verified in get method / Edit existing country objects
                if pk:
                    country = Country.objects.get(id=pk)
                    country.country = row[0]
                    country.capital = row[1]
                    country.country_code = row[2]
                    try:
                        country.hint = row[3]
                    except IndexError:
                        pass
                    country.save()
                    continue
                # Create new country objects
                try:
                    hint = row[3]
                    Country.objects.create(
                        country=row[0], 
                        capital=row[1], 
                        country_code=row[2],
                        hint=hint
                    )
                except IntegrityError:
                    pass
                except IndexError:
                    Country.objects.create(
                        country=row[0], 
                        capital=row[1], 
                        country_code=row[2]
                    )

        # Delete items from DB that are not in the updated CSV
        deletions = request.session.get('deletions')
        del request.session['deletions']

        if deletions:
            for pk in deletions:
                country = Country.objects.get(id=pk)
                country.delete()
        
        # Export CSV of updated database
        export_data = []
        countries = Country.objects.all()
        for country in countries:
            row = {}
            row['country'] = country.country
            row['capital'] = country.capital
            row['country_code'] = country.country_code
            row['hint'] = country.hint if hasattr(country, 'hint') else ""
            row['pk'] = country.id
            export_data.append(row)

        current_time = datetime.now()
        now = str(current_time)[:17].replace("-", "_").replace(" ", "_").replace(":", "_")

        with open(f"exported_data_{now}.csv", 'w') as export:
            writer = DictWriter(
                export,
                fieldnames=['country', 'capital', 'code', 'hint', 'pk']
            )
            writer.writeheader()
            for row in export_data:
                writer.writerow(
                    {
                        'country': row['country'],
                        'capital': row['capital'],
                        'code': row['country_code'],
                        'hint': row['hint'],
                        'pk': row['pk']
                    }
                )

        msg = 'Data successfully posted'
        return render(request, self.template_name, { 'message': msg })