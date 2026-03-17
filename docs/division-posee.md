# Division posee

## Objectif

Le composant `division posee` sert a reproduire une division scolaire francaise directement sur la feuille, sous forme d'objet flottant, editable et deplacable.

Il a deux objectifs simultanes :

- offrir une saisie tres guidee pour un enfant
- conserver un rendu visuel proche d'une vraie division posee sur cahier

Le composant est implemente principalement dans [components/math-workbook.tsx](/C:/Users/micro/Documents/Dev/maths-facile/components/math-workbook.tsx) et stylise dans [app/globals.css](/C:/Users/micro/Documents/Dev/maths-facile/app/globals.css).

## Vue d'ensemble UX/UI

La division posee est pensee comme un mini espace de travail plutot que comme une simple formule.

Elle comporte 3 zones principales :

- a gauche, le `dividende`
- sous le dividende, les `lignes de calcul`
- a droite, le `diviseur` et le `quotient`

Visuellement :

- le dividende et les calculs sont presentes dans des cases alignees
- le diviseur et le quotient sont aussi presentes dans des cases
- une potence de division est dessinee avec un trait vertical et un trait horizontal
- une ligne de calcul sur deux commence par un `-`
- ces lignes d'operation ont un trait vert pour signifier que la ligne suivante est le resultat de l'etape

### Principes d'ergonomie

Les choix d'interface suivent quelques principes simples :

- l'enfant doit pouvoir inserer la division directement sur la feuille, sans modal
- les champs principaux doivent etre faciles a remplir sans comprendre une structure technique
- les chiffres doivent rester alignes verticalement pour faciliter le calcul
- la progression doit etre naturelle : on ne montre pas trop de lignes vides d'un coup
- l'edition doit ressembler le plus possible a l'affichage normal

### Comportement de saisie

En mode edition :

- `dividende`, `diviseur` et `quotient` sont saisis dans des champs uniques
- mais ces champs sont affiches au-dessus d'une grille de cases pour garder un rendu scolaire
- les lignes de calcul restent en edition case par case

L'ordre de navigation clavier est :

1. `dividende`
2. `diviseur`
3. `quotient`
4. `work:0`
5. lignes suivantes

`Tab` et `Entree` permettent d'avancer. `Shift+Tab` permet de revenir en arriere.

### Gestion des lignes de calcul

Le composant n'affiche pas toutes les lignes des le debut.

Regle actuelle :

- au depart, une seule ligne de calcul est visible
- lorsqu'une ligne visible est remplie, la suivante apparait
- une ligne vide mais visible reste grisee
- le composant reserve un nombre maximum de lignes dependant surtout du quotient, avec un minimum de 8 lignes

Objectif :

- ne pas impressionner l'enfant avec un grand bloc vide
- montrer progressivement l'espace de calcul

### Gestion des nombres decimaux

`dividende`, `diviseur` et `quotient` acceptent :

- les chiffres
- une seule virgule

Pour aider la saisie :

- si l'enfant tape `.`, il est converti automatiquement en `,`
- les autres caracteres sont ignores

La virgule est conservee dans l'affichage des cases.

## Architecture technique

## Modele de donnees

La division posee correspond au type `DivisionBlock`.

Structure principale :

```ts
type DivisionBlock = {
  id: string;
  type: "division";
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
  caption: string;
  dividend: string;
  divisor: string;
  quotient: string;
  remainder: string;
  work: string;
};
```

Points importants :

- `dividend`, `divisor`, `quotient` sont stockes sous forme de chaines
- `work` stocke toutes les lignes de calcul dans une seule chaine, separees par des retours a la ligne
- la position sur la feuille est geree par `x` et `y`

## Fonctions utilitaires principales

### `getDivisionWorkLines(work)`

Transforme la chaine `work` en tableau de lignes.

Responsabilites :

- decouper sur `\n`
- nettoyer les espaces finaux
- garantir au moins une ligne

### `getDivisionQuotientDigits(quotient)`

Compte le nombre de chiffres utiles du quotient.

Responsabilites :

- ignorer les caracteres non numeriques
- garantir au moins 1

Cette valeur sert a calibrer la hauteur logique de la division.

### `normalizeDivisionDecimalInput(value)`

Normalise la saisie des champs libres.

Responsabilites :

- convertir `.` en `,`
- supprimer tout caractere non autorise
- n'autoriser qu'une seule virgule

Cette fonction est appliquee a `dividende`, `diviseur` et `quotient`.

### `getDivisionMaxWorkLines(quotient)`

Calcule le nombre maximum de lignes de calcul affichables.

Regle actuelle :

```ts
Math.max(8, getDivisionQuotientDigits(quotient) * 2 + 1)
```

Cette formule donne :

- un minimum confortable de 8 lignes
- plus de place si le quotient contient plus de chiffres

### `getDivisionVisibleWorkLines(work, quotient)`

Determine combien de lignes doivent etre affichees a l'instant T.

Logique :

- prendre les lignes reelles
- compter le prefixe deja rempli
- afficher une ligne vide supplementaire apres la derniere ligne remplie
- ne jamais depasser `getDivisionMaxWorkLines()`

### `setDivisionWorkLine(work, lineIndex, value)`

Met a jour une ligne precise de `work`.

Responsabilites :

- agrandir le tableau de lignes si necessaire
- remplacer la ligne cible
- supprimer les lignes vides inutiles a la fin

### `getDivisionLeftColumns(block)`

Calcule le nombre de colonnes de la zone gauche.

Base de calcul :

- longueur du `dividende`
- longueurs des lignes de `work`
- minimum visuel de 3 colonnes

Objectif :

- assurer un alignement strict entre le dividende et les calculs

### `getDivisionDivisorColumns(block)` et `getDivisionQuotientColumns(block)`

Calculent separement les colonnes de droite.

Pourquoi deux fonctions :

- le `diviseur` et le `quotient` ne doivent pas se forcer mutuellement a avoir la meme largeur
- chaque zone doit adapter ses cases a son propre contenu

### `renderDivisionCellRow(value, columns, className)`

Rend une rangee de cases visible.

Responsabilites :

- creer `columns` cases
- placer les caracteres un par un
- laisser les cases restantes vides

Cette fonction est reutilisee en affichage normal et dans les couches visuelles de l'edition.

## Rendu

## Affichage normal

Le rendu lecture seule est gere par `renderMathPreview(block)`.

Pour la division :

- calcul des colonnes gauche et droite
- calcul des lignes visibles
- rendu de la colonne gauche
- rendu de la colonne droite

Structure generale :

```tsx
division-preview
  division-left-column
    division-work-line head
      dividende
    division-work-grid
      lignes de calcul
  division-right-column
    diviseur
    quotient
```

## Affichage interactif

Le rendu interactif est gere par `renderInteractiveMathPreview(block)`.

Il reprend la meme structure que l'affichage normal, mais chaque sous-zone cliquable est encapsulee dans `renderBlockPreviewButton(...)`.

Objectif :

- permettre a l'enfant de cliquer directement sur la partie a modifier
- conserver exactement la meme structure visuelle

## Edition inline

Le rendu edition est gere par `renderInlineBlockEditor(block)`.

Il y a 2 strategies differentes :

- champs libres superposes pour `dividende`, `diviseur`, `quotient`
- cases individuelles pour les lignes de calcul

### Champs libres superposes

La fonction `renderDivisionNumericField(...)` est utilisee pour :

- `dividend`
- `divisor`
- `quotient`

Principe :

- un vrai `<input>` capte la saisie
- l'input est visuellement transparent
- dessous, une rangee de cases affiche la valeur
- l'enfant a l'impression d'ecrire directement dans les cases, mais la saisie reste simple

Pourquoi cette approche :

- taper `584` dans un seul champ est beaucoup plus naturel que se deplacer case par case
- on conserve quand meme un rendu scolaire aligne

### Lignes de calcul en cases

Les lignes `work` sont editees via `renderDivisionEditableRow(...)`.

Chaque case :

- accepte un caractere
- gere son propre focus
- avance automatiquement a la case suivante
- permet retour et effacement coherents au clavier

Cette partie est volontairement plus stricte, car elle represente les calculs poses ligne par ligne.

## Navigation clavier

La navigation est geree principalement dans :

- `handleInlineBlockKeyDown(...)`
- `moveDivisionCellFocus(...)`

Comportements notables :

- `Tab` avance entre les zones logiques
- `Shift+Tab` recule
- `Entree` avance comme une validation locale
- dans les lignes de calcul, `Entree` peut passer a la ligne suivante
- `ArrowLeft` et `ArrowRight` naviguent entre cases
- `Backspace` sur une case vide peut revenir a la precedente

## CSS et structure visuelle

Les styles sont dans [app/globals.css](/C:/Users/micro/Documents/Dev/maths-facile/app/globals.css).

Classes importantes :

- `.division-layout`
- `.division-preview`
- `.division-left-column`
- `.division-right-column`
- `.division-work-grid`
- `.division-work-line`
- `.division-work-line-operation`
- `.division-work-line-pending`
- `.division-cell-row`
- `.division-cell`
- `.division-cell-input`
- `.division-number-field`
- `.division-dividend-field`
- `.division-divisor-field`
- `.division-quotient-field`

### Roles CSS principaux

`.division-preview`
- organise la division en 2 colonnes : gauche et droite

`.division-right-column`
- porte la barre verticale noire
- reste etiree sur toute la hauteur du bloc

`.division-quotient`
- porte la barre horizontale noire

`.division-work-line-operation`
- ajoute le trait vert sous une ligne d'operation

`.division-number-field`
- sert de conteneur commun pour les champs libres superposes

## Decisions UX importantes

### Pourquoi des champs libres pour certaines zones

Pour un enfant, saisir `584` ou `12,5` dans un seul champ est beaucoup plus simple que :

- cliquer dans la premiere case
- taper un chiffre
- passer a la suivante
- gerer la virgule manuellement

Le choix retenu est donc :

- saisie libre pour les zones "structurelles"
- edition en cases pour les lignes de calcul

### Pourquoi les lignes apparaissent progressivement

Une division posee contient beaucoup d'espace vide potentiel. L'afficher en entier d'un coup :

- charge visuellement l'ecran
- intimide
- rend l'objet plus haut qu'utile

Le systeme progressif permet de garder la division compacte.

### Pourquoi conserver les cases en mode edition

Le rendu normal et le rendu edition doivent se ressembler.

Si l'edition bascule vers une autre interface trop differente :

- l'enfant perd ses reperes
- le lien entre saisie et resultat visuel se casse

La superposition champ libre + cases visibles permet de garder cette continuite.

## Limites actuelles

- la virgule occupe encore une case complete
- le bloc ne guide pas encore les etapes mathematiques de la division elle-meme
- la gestion des retenues, des decalages de virgule et des zeros ajoutes reste manuelle
- `remainder` existe dans le type, mais n'est plus au centre du modele visuel actuel

## Pistes d'evolution

### Evolutions UX

- rendre la virgule visuellement plus compacte qu'une case
- proposer des aides contextuelles pour les divisions decimales
- afficher un repere sur la ligne active
- proposer un mode "division guidee" encore plus scolaire

### Evolutions techniques

- extraire toute la logique de division dans un module dedie
- isoler les helpers dans un fichier utilitaire
- ecrire des tests unitaires sur :
  - `normalizeDivisionDecimalInput`
  - `getDivisionVisibleWorkLines`
  - calcul du nombre de colonnes

## Resume

Le composant `division posee` combine :

- une logique de bloc flottant sur une feuille libre
- une structure visuelle tres scolaire
- une edition hybride :
  - champs libres pour les nombres principaux
  - edition case par case pour les calculs

Le point cle de sa conception est l'equilibre entre :

- simplicite de saisie pour l'enfant
- fidelite visuelle a une vraie division posee
