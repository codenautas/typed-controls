# tedede
TDD

<!-- cucardas -->
![designing](https://img.shields.io/badge/stability-designing-red.svg)
[![npm-version](https://img.shields.io/npm/v/tedede.svg)](https://npmjs.org/package/tedede)
[![downloads](https://img.shields.io/npm/dm/tedede.svg)](https://npmjs.org/package/tedede)
[![build](https://img.shields.io/travis/codenautas/tedede/master.svg)](https://travis-ci.org/codenautas/tedede)
[![coverage](https://img.shields.io/coveralls/codenautas/tedede/master.svg)](https://coveralls.io/r/codenautas/tedede)
[![climate](https://img.shields.io/codeclimate/github/codenautas/tedede.svg)](https://codeclimate.com/github/codenautas/tedede)
[![dependencies](https://img.shields.io/david/codenautas/tedede.svg)](https://david-dm.org/codenautas/tedede)
[![qa-control](http://codenautas.com/github/codenautas/tedede.svg)](http://codenautas.com/github/codenautas/tedede)

<!--multilang v0 es:LEEME.md en:README.md -->

<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

<!--lang:es-->

## Instalación

<!--lang:en--]

## Install

[!--lang:*-->

```sh
$ npm install -g tedede
```

<!--lang:es-->

## Uso (línea de comandos)

<!--lang:en--]

## Usage (command-line)

[!--lang:*-->

```sh
$ pwd
/home/user/npm-packages/this-module
```

<!--lang:es-->

```sh
$ tedede --list-langs
Idiomas disponibles: en es

$ tedede . --lang=es
Listo sin advertencias!
```

<!--lang:en--]

```sh
$ tedede --list-langs
Available languages: en es

$ tedede . 
Done without warnings!
```

[!--lang:es-->

## Uso (código)

<!--lang:en--]

## Usage (code)

[!--lang:*-->

```js
var qaControl = require('tedede');

qaControl.controlProject('./path/to/my/project').then(function(warnings){
    console.log(warnings);
});

```

## License

[MIT](LICENSE)

----------------


