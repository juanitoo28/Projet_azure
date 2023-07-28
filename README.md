# Projet Angular Front et projet Django Back
Le projet est déployé en ligne aux adresses suivantes:
django: https://newapp2.azurewebsites.net/images/
angular: https://app-angular-azure-b8b230ef7406.herokuapp.com/

Vous pouvez aussi le lancer en local vient ces commandes:

Projet Django:
Git clone la branche "django"

Lancer le serveur avec la commande : 
python manage.py runserver

Si vous rencontrez une erreur concernant les modules, merci de bien vouloir rentrer dans l'environnemment virtuel:
cd mon_env

Ensuite:
source bin/activate

Une fois activé, taper:
cd ..

Normalement vous devriez voir tout à gauche du chemin dans le terminal le nom de votre environnement virtuel:
(mon_env)

Ensuite relancer le serveur avec la commande : 
python manage.py runserver


Projet Angular: 
Git clone la branche "angular"

Modifier le fichier environnement.ts qui se trouve dans le dossier src/environnements:
Changer le chemin de la production par localhost:
export const environment = {
  production: true,
  apiUrl: "http://localhost:8000", // Remplacez ceci par l'URL de votre serveur Django en production
};

Ouvrir le terminal et exécuter : 
npm install

Ensuite lancer le projet: 
ng serve

Lien du trello : https://trello.com/invite/b/LMEdvwCz/ATTI557e97c4cc35e239854486db613b5ea31F8BEFDD/digital-asset-management

Lien de la documentations : https://projetbigdata.atlassian.net/wiki/spaces/~712020f9e088ab30ab4236bb5f4e95bc18924b/pages/491521/DFA+-+Descriptif+Fonctionnelle+Applicative

Lien vers le powerpoint : 
https://docs.google.com/presentation/d/1162Q7KsxA8KSnyiWwwmUBgqbnLKysHrjSsrR3WPhNeQ/edit?usp=sharing
