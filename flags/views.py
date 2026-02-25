from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import PermissionRequiredMixin
from django.shortcuts import redirect, render
from django.views.generic.edit import CreateView

from .forms import PopulateDbForm


# Create your views here.
@login_required
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
        
        #TODO : Test data.csv and provide report
        #TODO : if csv invalid show error and hide form

        form = PopulateDbForm()

        context = { 'form': form }
        return render(request, self.template_name, context)
    
    def post(self, request):
        if not request.user.is_superuser:
            return redirect('index')
        
        form = PopulateDbForm(request.POST)

        #TODO : are the next 3 lines necessary given the form is just a submit button
        if not form.is_valid():
            context = { 'form': form }
            return render(request, self.template_name, context)
        
        #TODO : clear any data removed from CSV - i.e. primary key in DB not found in CSV
        #TODO : process and puplate database based on CSV data changes / add new fields
        
        msg = 'Data successfully posted'
        context = { 'message': msg }
        return render(request, self.template_name, context)