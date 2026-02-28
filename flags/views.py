from csv import reader

from django.contrib.auth.mixins import PermissionRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.shortcuts import redirect, render
from django.views.generic.edit import CreateView

from .forms import PopulateDbForm
from .models import Country


# Create your views here.
def index(request):
    return render(request, 'index.html')


# Superuser view for pupulating DB
class PopulateDbView(PermissionRequiredMixin, CreateView):
    permission_required = [
        'flags.add_country',
        'flags.change_country',
        'flats.delete_country'
    ]
    template_name = 'flags/populate_db.html'

    def get(self, request):
        if not request.user.is_superuser:
            return redirect('index')
        
        try:
            old_pk_list = Country.objects.values_list('id', flat=True)
        except:
            old_pk_list = []

        try:
            with open('data.csv') as csv:
                new = 0
                updated_pk_list = []
                data_reader = reader(csv)
                next(data_reader)
                for row in data_reader:
                    try: 
                        _, _, _ = row[0], row[1], row[2]
                    except IndexError:
                        raise ValueError
                    try:
                        pk_str = row[4]
                    except:
                        pk_str = False
                    if pk_str:
                        try:
                            pk = int(pk)
                            updated_pk_list.append(pk)
                        except:
                            TypeError
                    else:
                        new += 1          
        except (ValueError, TypeError):
            msg = "Error: Review data.csv and fix errors then refresh this page."
            return render(request, self.template_name, { 'message': msg })
        
        for pk in updated_pk_list:
            if pk not in old_pk_list:
                msg = f"Error: primary key {pk} does not exist in database."
                msg += "<br>Correct CSV then refresh the page"
                return render(request, self.template_name, { 'message': msg })

        edits, deletions = 0, []
        for pk in updated_pk_list:
            if pk in old_pk_list:
                edits += 1
            else:
                deletions.append(pk)

        if new == 0 and edits == 0 and deletions == 0:
            msg = 'Nothing to edit'
            return render(request, self.template_name, { 'message': msg })
        
        msg = f"New entries: {new}<br>Edited entries: {edits}"
        msg += f"<br>Deleted entries: {len(deletions)}" 
        form = PopulateDbForm()
        context = { 'form': form, 'message': msg }

        if deletions:
            request.session['deletions'] = deletions
        return render(request, self.template_name, context)
    
    def post(self, request):
        if not request.user.is_superuser:
            return redirect('index')
        
        form = PopulateDbForm(request.POST)

        if not form.is_valid():
            return render(request, self.template_name, { 'form': form })

        with open('data.csv') as csv:
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
        deletions = request.session.get['deletions']
        del request.session['deletions']

        for pk in deletions:
            country = Country.objects.get(id=pk)
            country.delete()
        
        #TODO : create updated CSV of updated DB

        msg = 'Data successfully posted'
        return render(request, self.template_name, { 'message': msg })