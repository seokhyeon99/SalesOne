from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings

class CustomAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        """
        This is called when saving user via allauth registration.
        We override this to set additional data on user object.
        """
        # Get the data from the form
        data = form.cleaned_data
        
        # Set the user's email
        user.email = data.get('email')
        
        # Set other required fields
        user.first_name = data.get('first_name', '')
        user.last_name = data.get('last_name', '')
        
        if 'password1' in data:
            user.set_password(data["password1"])
        else:
            user.set_unusable_password()
            
        self.populate_username(request, user)
            
        if commit:
            user.save()
            
        return user
    
    def populate_username(self, request, user):
        """
        Override the populate_username since we don't use usernames.
        """
        pass 