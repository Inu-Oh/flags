from csv import reader

from django.contrib.auth.mixins import PermissionRequiredMixin
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
                for row in data_reader:
                    try: 
                        _, _, _ = row[0], row[1], row[2]
                    except IndexError:
                        raise ValueError
                    try:
                        pk_str = row[3]
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
        
        edits, deletions = 0, 0
        for int in updated_pk_list:
            if int in old_pk_list:
                edits += 1
            else:
                deletions 

        if new == 0 and edits == 0 and deletions == 0:
            msg = 'Nothing to edit'
            return render(request, self.template_name, { 'message': msg })
        
        msg = f'New entries: {new}<br>Edited entries: {edits}<br>Deleted entries: {deletions}'   
        form = PopulateDbForm()
        context = { 'form': form, 'message': msg }

        return render(request, self.template_name, context)
    
    def post(self, request):
        if not request.user.is_superuser:
            return redirect('index')
        
        form = PopulateDbForm(request.POST)

        #TODO : are the next 3 lines necessary given the form is just a submit button
        if not form.is_valid():
            return render(request, self.template_name, { 'form': form }
)
        
        #TODO : clear any data removed from CSV - i.e. primary key in DB not found in CSV
        #TODO : process and puplate database based on CSV data changes / add new fields
        
        msg = 'Data successfully posted'
        return render(request, self.template_name, { 'message': msg })