# Generated by Django 4.2 on 2023-04-25 14:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("monapplication", "0004_alter_image_image_file"),
    ]

    operations = [
        migrations.AlterField(
            model_name="image",
            name="image_file",
            field=models.ImageField(upload_to="images/"),
        ),
    ]
