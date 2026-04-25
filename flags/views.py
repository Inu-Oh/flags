from csv import reader, DictWriter
from datetime import datetime
from random import choice
import shutil

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


def check_session(request):
    if 'quiz' in request.session:
        quiz = request.session['quiz']
    else:
        quiz = False
    return JsonResponse({ 'quiz': quiz })


def get_capital_ans(request):
    pk = request.session['question_id']
    country = Country.objects.get(id=pk)
    capital = country.capital
    return JsonResponse({'capital': capital})


def get_country_ans(request):
    pk = request.session['question_id']
    country = Country.objects.get(id=pk)
    country_name = country.country
    return JsonResponse({'country': country_name})


def get_id(request):
    if not 'quiz_list' in request.session:
        pass # TODO return to home page or other solution
    quiz_list = request.session['quiz_list']

    if len(quiz_list) > 0:
        next_id = choice(quiz_list)
        quiz_list.remove(next_id)
        request.session['quiz_list'] = quiz_list
        request.session['question_id'] = next_id
        end_quiz = False
    else:
        end_quiz = True

    return JsonResponse({'endQuiz': end_quiz})


def get_flag_q(request):
    pk = request.session['question_id']
    country = Country.objects.get(id=pk)
    # Change domain for production
    flag = "http://127.0.0.1:8000/static/images/" + str(country.country_code) + ".png"
    hint = str(country.hint) if country.hint is not None else ""
    return JsonResponse({ 'flag': flag, 'hint': hint })


def get_q(request):
    pk = request.session['question_id']
    country = Country.objects.get(id=pk)
    match request.session['quiz']:
        case "capital_country":
            q = country.capital
        case "country_capital":
            q = country.country
        case _:
            q = False
    hint = str(country.hint) if country.hint is not None else ""
    return JsonResponse({ 'hint': hint, 'question': q })


def quiz_result(request):
    count = Country.objects.all().count()
    score = request.session['score']
    result = round((score / count) * 100)
    return JsonResponse({'score': score, 'result': result})


def get_score(request):
    if len(request.session['quiz_list']) < 1:
        return quiz_result(request)
    return update_scoreboard(request)


def set_capital_list(request, quiz_name):
    # Set list of question IDs for flaq quiz with capital vals & get question count
    quiz_list = list(
        Country.objects.exclude(capital=0).values_list('id', flat=True).distinct())
    return set_quiz_session(request, quiz_list, quiz_name)


def set_country_list(request):
    # Set list of question IDs for flag country quiz & get question count
    quiz_list = list(Country.objects.all().values_list('id', flat=True).distinct())
    return set_quiz_session(request, quiz_list, "flag_country")


def set_quiz_session(request, quiz_list, quiz_name):
    first_q_id = choice(quiz_list)
    quiz_list.remove(first_q_id)
    request.session['quiz_list'] = quiz_list
    request.session['question_id'] = first_q_id
    request.session['score'] = 0
    request.session['quiz'] = quiz_name
    return HttpResponse(status=204)


def update_score(request):
    if 'score' in request.session:
        request.session['score'] += 1
    else:
        request.session['score'] = 1
    if len(request.session['quiz_list']) < 1:
        return quiz_result
    return update_scoreboard(request)


def update_scoreboard(request):
    try:
        score = request.session['score']
        questions_remaining = len(request.session['quiz_list'])
        scoreboard_text = f"Score: {score} &nbsp;&nbsp Flags left: {questions_remaining}"
        return JsonResponse({'scoreboardText': scoreboard_text})
    except:
        return JsonResponse({'scoreboardText': "Refresh to see your score."})


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

        # Create researchable list and dictionary of existing DB objects
        db_pk_list = Country.objects.all().values_list('id', flat=True)
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
                                    country['country_bu'] = row[0]
                                    country['country'] += " => "+row[0]
                                if country['capital'] != row[1]:
                                    country['capital_bu'] = row[1]
                                    country['capital'] += " => "+row[1]
                                if country['cc'] != row[2]:
                                    country['cc_bu'] = row[2]
                                    country['cc'] += " => "+row[2]
                                if country['hint'] != row[3]:
                                    country['hint_bu'] = row[3]
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

        if len(dup_country) > 0 or len(dup_cc) > 0 or len(dup_pk):
            msg = "<h3>Error</h3>"
            msg += "The CSV import file includes duplicate country names or codes or "
            msg += "primary keys. Correct any errors before proceeding.<br><br>"
            msg += f"Duplicate countries: {dup_country}<br>Duplicate country codes: "
            msg += f"{dup_cc}<br>Duplicate primary keys: {dup_pk}"

            return render(request, self.template_name, {'message': msg})

        # Set data on deleted items
        csv_pk_list = [pk for pk, count in pk_dict.items()]
        
        deletions = []
        for pk in db_pk_list:
            if pk not in csv_pk_list:
                deleted_country = next(country for country in db_data if int(country['pk']) == pk)
                deleted_country['status'] = 'deleted'
                deletions.append(pk)

        # Prepare all data for context, form and session if validation is successful
        msg = "<h3>Update Summary</h3>"
        if 'update_msg' in request.session:
            msg += f'<p class="text-success fw-bold">{request.session['update_msg']}</p>'
            del request.session['update_msg']
        else:
            msg += f"New entries: {new}<br>Edited entries: {edits}<br>Unchanged entries: "
            msg += f"{unchanged}<br>Deleted entries: {len(deletions)}"

        # Prepare data for GET view and POST session
        form = PopulateDbForm()
        filtered_db_data = [country for country in db_data if country.get('status', 'ignore')
                            in ['new', 'edited', 'deleted']]
        sorted_db_data = sorted(db_data, key=lambda country: country.get('status', 'ignore'))
        changes = True if (new > 0 or edits > 0 or len(deletions) > 0) else False

        request.session['deletions'] = deletions if deletions else []
        request.session['db_data_changes'] = filtered_db_data

        context = { 'form': form, 'message': msg, 'db': sorted_db_data, 'changes': changes }            
        return render(request, self.template_name, context)
    
    def post(self, request):
        if not request.user.is_superuser:
            return redirect('index')
        
        form = PopulateDbForm(request.POST)

        if not form.is_valid():
            return render(request, self.template_name, { 'form': form })

        # Make changes to objects stored in database base on test in GET saved to session
        db_data_changes = request.session.get('db_data_changes')
        for country in db_data_changes:
            if country['status'] == 'new':
                new_country = Country(
                    country=country['country'],
                    capital=country['capital'],
                    country_code=country['cc'],
                )
                if country['hint']:
                    new_country.hint = country['hint']
                new_country.save()
                country['pk'] = new_country.pk
            elif country['status'] == 'edited':
                updated_country = Country.objects.get(pk=int(country['pk']))
                if updated_country.country != country['country']:
                    updated_country.country = country['country_bu']
                if updated_country.capital != country['capital']:
                    updated_country.capital = country['capital_bu']
                if country['hint'] and (updated_country.hint != country['hint']):
                    updated_country.hint = country['hint_bu']
                if updated_country.country_code != country['cc']:
                    updated_country.country_code = country['cc_bu']
                updated_country.save()
            elif country['status'] == 'deleted':
                Country.objects.filter(id=int(country['pk'])).delete()

        # Clear session data
        del request.session['deletions']
        del request.session['db_data_changes']

        # Export CSV of updated database as import_data.csv and save copy of old CSV
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
        shutil.copy('import_data.csv', 'copy_of_db_bf_update_'+now+'.csv')

        with open(f"import_data.csv", 'w') as export:
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

        request.session['update_msg'] = 'Data successfully posted'
        return redirect('manage_content')