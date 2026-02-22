from django import forms

from flags.models import Country


class PopulateDbForm(forms.Form):
    widgets = {'any_field': forms.HiddenInput(),}