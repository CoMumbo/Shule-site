import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Create the superuser from env vars if it doesn't already exist."

    def handle(self, *args, **options):
        email = os.getenv("DJANGO_SUPERUSER_EMAIL")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD")
        first_name = os.getenv("DJANGO_SUPERUSER_FIRST_NAME", "")
        last_name = os.getenv("DJANGO_SUPERUSER_LAST_NAME", "")

        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    "Skipping superuser creation: DJANGO_SUPERUSER_EMAIL or "
                    "DJANGO_SUPERUSER_PASSWORD not set."
                )
            )
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.SUCCESS(f"Superuser {email} already exists.")
            )
            return

        User.objects.create_superuser(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        self.stdout.write(
            self.style.SUCCESS(f"Superuser {email} created.")
        )
