# estudio prelminar

## pantalla de edición

En el DOM se ponen los elementos que permiten **editar** los datos. Los datos están en otro lado 
(no residen en los "values" de los elementos del DOM)

### a largo plazo

A largo plazo estas características son deseables. Llamamos **almacén** al lugar donde residen los datos. 

característica      | descripción
--------------------|--------------
ida y vuelta        | si se interactúa con un elemento modificando el dato (value, checked, textContent o lo que sea) se modifica el almacén. A su vez si se modifica el almacén se refleja el valor en los elementos del DOM
vistas simultáneas  | podría ocurrir que haya varios elementos del DOM asociados al mismo registro y/o campo del almacén.
elementos complejos | para visualizar un valor podría ser necesario más de un elemento del DOM (por ejemplo timestamp with timezone se podría mostrar en varios). Esto podría traer un problema con el blur (porque el blur debe considerarse al salir del conjunto de elementos)
texto vacío vs null | debería poder diferenciar entre un valor null de un texto o una cadena vacía
lógico por teclado  | es deseable que el cursor pueda caer en un elemento de tipo lógico sí/no y que se pueda usar con el teclado (para un data entry)
fechas por teclado  | es deseable que las fechas se puedan escribir como si fueran textos
feedback por campo  | de algún modo tiene que haber una manera extendida de ver en texto completo cuál es el problema que hay cuando no se puede grabar un dato (ej: la fecha no es válida, o el almacén falla al recibir datos)
registros           | debe existir el concepto de registro completo y de "salir de un registro"
consistencias       | debe informar cuando se le guardan datos inconsistentes
saltos              | debe saltear los campos que no deberían poder ingresarse
tablas              | debe poder mostrar más de un registro a la vez
flechas             | debe poder mover el cursor entre campos y entre registros usando las flechas
crear registro      | debe permitir crear registros
eliminar registro   | debe poder eliminar un registro
maestro detalle     | debe permitir el esquema de maestro detalle
opciones a la vista | debe mostrar las opciones (para los conjuntos cerrados de opciones)

## implementación

### adapter

Los elementos van a tener un adaptador que sabe hacer get y set. 
Las funciones públicas de un elemento adaptado son: `setTypedValue` y `getTypedValue`. 
