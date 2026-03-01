from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.urls import reverse

from django.db import models

# Create your models here.
class Country(models.Model):
    country = models.CharField(
        max_length=50, 
        unique=True, 
        blank=False,
        validators=[MinLengthValidator(4), MaxLengthValidator(50)]
    )
    capital = models.CharField(
        max_length=50,
        blank=False,
        validators=[MinLengthValidator(4), MaxLengthValidator(50)]
    )
    hint = models.CharField(
        max_length=150,
        null=True
    )
    country_code = models.CharField(
        max_length=6,
        unique=True, 
        blank=False,
        validators=[MinLengthValidator(2), MaxLengthValidator(6)]
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['country']

    def get_absolute_url(self):
        """Returns the URL to access a particular instance of the Country model"""
        return reverse("model-detail-view", args=[str(self.id)])
    
    def save(self, *args, **kwargs):
        """Converts string case of country, capitad and country code before saving"""
        self.country = self.country.title()
        self.capital = self.capital.title()
        self.country_code = self.country_code.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.country_code.upper() + ' ' + self.country[:10]