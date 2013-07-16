#eB05 – Dokumentation

## 1. Die Ordnersturktur (in progress)
```
eB05
├–– Controller
|   └–– controller.js
├–– Model
|   ├–– event.js
|   ├–– group.js
|   └–– vote.js
├–– Public
|   ├–– css
|   |   └–– style.css
|   ├–– images
|   ├–– js
|   |   └–– scripts.js
|   ├–– html
|   |   ├–– index.html
|   |   ├–– login.html
|   |   └–– main.html
|   ├–– less
|   |   ├–– _768up.less
|   |   ├–– _1100up.less
|   |   ├–– _base.less
|   |   ├–– _grid.less
|   |   ├–– _mixins.less
|   |   └–– style.less
|   └–– libs
|       ├–– jquery
|       |   └–– jquery-1.9.1.js
|       ├–– jquery.mobile
|       |   └–– jquery.mobile-1.3.0.js
|       └–– normalize
|           └–– normalize-2.1.1.css
├–– node-modules
|    ├–– mongoose
|    ├–– director
|    └–– mustache
├–– Router
|   └–– router.js
├–– Service
|   └–– service.js
├–– app.js
├–– package.json
└-– README.md
```

## 2 Node Packages
Node Packages sind im Ordner node-modules **lokal**, also im Projekt, zu installieren

### 2.1 Aktuell zusätzlich verwendete Node Packages
* mongoose (MongoDB - https://github.com/LearnBoost/mongoose)
* director (Routing - https://github.com/flatiron/director)
* mustache (Templating - https://github.com/raycmorgan/Mu)

## 3. package.json
In der Package.json stehen die Projekt-Informationen.
Hier stehen auch die Dependencies, falls ihr also das App aufruft oder ein neues Modul mit NPM installieren wollt und einen Fehler bekommt, hier rein schauen ;-)

## 4. /Public/less
### 4.1 less Dokumentation
http://lesscss.org/

###4.2 less Compiler
**Windows**
* http://wearekiss.com/simpless
* http://koala-app.com/
* http://winless.org/

**Mac**
* http://incident57.com/less/ (das App bentuze ich)
* http://wearekiss.com/simpless

### 4.3 less-Aufbau
* In der style.less werden alle anderen .less Dateien importiert

## 5. /Public/libs
Hier werden alle Third Party Bibliotheken zu finden sein. Diese werden wenn möglich während dem Projekt nicht mehr aktualisiert!

## 6. Projektkonventionen
Bitte stellt eure IDE auf 1 Tab sind 4 Leerzeichen, sodass unsere Dokumente nicht wie Kraut und Rüben aussehen :-)
Weiter Konventionen können gerne Nachgetragen werden!