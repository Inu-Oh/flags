from django.contrib.auth.mixins import PermissionRequiredMixin
from django.shortcuts import redirect, render
from django.views.generic.edit import CreateView

from .forms import PopulateDbForm


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
        form = PopulateDbForm()

        context = { 'form': form }
        return render(request, self.template_name, context)
    
    def post(self, request):
        pass