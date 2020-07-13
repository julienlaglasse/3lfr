//! nom du fichier
var FILE = 'data.txt';

// nombre de ligne et nombre de cellules par ligne
var LIGNES = window.innerWidth > 1024 ? 676 : 676 * 2;
var CELLULES = window.innerWidth > 1024 ? 26 : 13;


// retourne la clé du triplet en fct de sa combinaison de lettre qu'on rentre en paramètre (aaa = 0, aab = 1...)
getKey = (datum) => {
    var convert = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    let interest = datum.substring(0,3); // on récupère les 3 nombres qui nous intéresse (aaa.fr -> aaa)
    let key = (convert.indexOf(interest[0]) * Math.pow(26, 2)) + (convert.indexOf(interest[1]) * 26) + convert.indexOf(interest[2]);
    return key;
}
/**
 * fonction récursive pour générer de façon très rapide un ensemble de cellule d'un tableau
 * lorsque l'on a un grand nombre de cellule à générer, on découpe ce nombre en 2 plusieurs fois jusqu'à générer 1 cell à la fois et les coller après
 *
 * nbCells:Number : le nombre de cellules de notre tableau
 * return:string : une chaine de caractère représentant un ensemble de cellule d'un tableau
 */
buildCells = (nbCells)=> {
    if (nbCells == 1) {
        let line = '<td class="gray"></td>';
        return line;
    }
    else if (nbCells % 2) { // nbCells impair <=> nbCells % 2 === 1 == true : on teste la parité
        return buildCells((nbCells - 1) / 2) + buildCells((nbCells + 1) / 2);
    }
    return buildCells(nbCells / 2) + buildCells(nbCells / 2);
}

/**
 * fonction récursive pour générer de façon très rapide un ensemble de ligne
 * lorsque l'on a un grand tableau à générer, on va le couper plusieurs en fois en deux, jusqu'à avoir des tableau de 1 ligne que l'on va fusionner
 * 
 * nbLigne:Number : le nombre de ligne de notre tableau
 * return:string : une chaine de caractère représentant un ensemble de ligne d'un tableau
 */
buildLines = (nbLigne) => {
    if (nbLigne == 1) {
        let line = '<tr>' + buildCells(CELLULES) + '</tr>';
        return line;
    }
    else if (nbLigne % 2) {
        return buildLines((nbLigne - 1) / 2) + buildLines((nbLigne + 1) / 2);
    }
    return buildLines(nbLigne / 2) + buildLines(nbLigne / 2);
}


if (window.XMLHttpRequest) { // Mozilla, Safari, IE7+...
    httpRequest = new XMLHttpRequest();
}
else if (window.ActiveXObject) { // IE 6 et antérieurs
    httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
}

httpRequest.onreadystatechange = function () { // on executera cette fonction quand on aura reçu les données
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {



            // lorsque l'on a reçu les données, on retire le message de chargement
            document.getElementById('chargement').remove();
            document.getElementById('navLinks').style.display = 'flex';

            //config des dates
            let mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            let jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

            // date du document
            let date = new Date(httpRequest.getResponseHeader("Last-Modified"));
            let formatDate = ' - Dernière modification le ' + jours[date.getDay()] + ' ' + date.getDate() + ' ' + mois[date.getMonth()] + ' ' + date.getFullYear() + ' à ' + date.getHours() + ':' + date.getMinutes();
            
            // modifs du DOM
            document.getElementById('title').innerHTML = FILE;
            document.getElementById('titre').innerHTML = FILE + formatDate;
            let tableau = document.getElementById('mainTableBody');

            // formattage des données
            let data = httpRequest.responseText.split('\n');
            sortedData = data.sort();
            sortedData.shift();
            let formatedData = {};
            for (let datum of sortedData) {
                if (datum != "") {
                    formatedData[getKey(datum)] = datum;
                }
            }

            // génération du tableau en fonction du formattage
            var lineToSuppr // nombre de lignes inutiles (premières lignes sans valeur)
            for (var prop in formatedData) {
                if (formatedData.hasOwnProperty(prop)) {
                    if (formatedData[prop] === sortedData[0])
                        lineToSuppr = Math.trunc(prop / CELLULES);
                    break;
                }
            }
            tableau.innerHTML += buildLines(LIGNES - lineToSuppr);
            
            // remplissage des cases
            for(let key in formatedData){
                line = Math.trunc((key / CELLULES) - lineToSuppr);
                cell = key % CELLULES;
                lineElem = tableau.children[line];
                cellElem = lineElem.children[cell];
                cellElem.innerHTML = formatedData[key];
                cellElem.style.backgroundColor = 'lightgreen';
            }
            
            // séparation lors du passage de Xzz à Yaa (se fait toutes les 26 * (26 / CELLULES) lignes) + ancrage pour navigation
            let sep = 26 * (26 / CELLULES);
            tableau.children[0].id= 0; // ancrage de la première ligne
            for (let i = sep - lineToSuppr; i < LIGNES - sep; i += sep) {
                lineSep = tableau.children[i-1];
                lineSep.classList.add('separation');
                tableau.children[i].id = (i + lineToSuppr) / sep; // ancrage de la 2eme à la dernière ligne
            }
        } else {

            // s'il y a un problème dans la requête, on retire le message de chargement et on affiche un message d'erreur
            document.getElementById('chargement').remove();
            document.getElementById('body').innerHTML = '<h1 style="border: 2px solid red; font-weight: bold">/!\\ PROBLEME LORS DU CHARGEMENT DES DONNEES /!\\</h1>';
        }
    }
};


httpRequest.open('GET', FILE, true); // on requête le fichier avec la méthode GET, le true signifie qu'on le fait en asynchrone
httpRequest.send(); 
