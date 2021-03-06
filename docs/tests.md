# test de Typed Controls

## introducción

Typed Controls está diseñado para funcionar en ambos lados: cliente y servidor. Empezamos desarrollando la funcionalidad del lado del cliente. 

Typed Controls conoce un conjunto amplio de tipos de datos y varias maneras de crear controles HTML5 que los soporten. 

Actualmente hay dos tipos de test que corremos sobre Typed Controls (ambos para cubrir la funcionalidad del lado del cliente):
 
  1. Los que se corren con **mocha** sobre todos los navegadores instalados. Tienen la limitación de no poder usar eventos "non trusted". 
  2. Los que se corren con **casper** sobre PhantomJS para probar los manejadores de eventos (esta es la única manera de generar eventos de usuario "trusted" para ver la funcionalidad completa). Tiene la limitación de no poder correrse en todos los navegadores. 

## cobertura

Como siempre nuestro objetivo es acercarnos lo más posible al 100% de covertura 
(marcando como excepciones solo las lineas que realmente no se pueden probar por cuestiones teóricas demostradas).

Cuando se programa para varios navegadores hay código (ciertas ramas) que solo están para funcionar en algunos navegadores. 
Entonces un reporte de cobertura para cada navegador no es útil. 

**El reporte final de cobertura** debe incluir todos los tests: los de mocha, los de casper y los del lado del servidor (todavía no hay)

### estado actual

 - [x] Cobertura con istanbul para los test basados en mocha.
 - [x] El script `npm run report` unifica los test de istanbul de mocha para generar un test unificado en `~~\typed-controls\coverage\index.html`
 - [ ] Test de cobertura con istanbul para los test basados en casper. #2
 - [ ] Lugar para poner los tests del lado del servidor. #3
 - [ ] Comprobar que `npm run report` toma automáticamente el resultado de esos tests. #4
 - [ ] Integrar todo en `~~\typed-controls\server\pdemo-server.js`. #4
