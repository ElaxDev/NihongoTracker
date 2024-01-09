# NihongoTracker

## Overview

Esta es una aplicación para llevar un registro de la inmersión en japonés de diferentes tipos, ya sea de video, anime, lectura de novelas ligeras, lectura de manga, lectura de novelas visuales, escucha, y tiempo para cosas que estén fuera de esas categorías.

Funciones que va a tener:

- Esenciales:

  - Perfiles de usuario.
  - Estadísticas de inmersión.
  - Integración con Anki.
  - Conexión a la API de Anilist.
&nbsp;
- No esenciales:
  - Metas de inmersión diarias.
  - Sistema de experiencia y de niveles.
  - Logros.
  - Medallas.
  - Clasificación de usuarios.
  - Recomendaciones de acuerdo al nivel.

## Backend

El _backend_ estará hecho en express, typescript y mongodb.

Estará alojado en una plataforma de alojamiento que todavía no se ha decidido.

### APIs que se van a utilizar

Estas serán las APIs con las cuales se va a integrar el proyecto (al momento de escribir esto):

- Kitsu o Anilist para el anime y el manga (Probablemente Anilist).
- VNDB para las novelas visuales.

## Frontend

El frontend estará hecho en React.

## Requisitos Funcionales

### A) Navegación

| **Identificación del requerimiento:** |NT-A1|
|---------------------------------------|-----|
| **Nombre del requerimiento:**|Página de inicio de la aplicación|
| **Descripción del requerimiento:**| Se debe mostrar una página web como interfaz de inicio. Aquí es donde el usuario llega al acceder a la aplicación por primera vez. Se hace referencia a las principales funciones de la aplicación y se enlaza a los formularios de registro y acceso.|
|**Roles**|Usuarios no registrados|
| **Prioridad del requerimiento:**|Muy Alta|

| **Identificación del requerimiento:** |NT-A2|
|---------------------------------------|-----|
| **Nombre del requerimiento:**|Tour de la aplicación|
| **Descripción del requerimiento:**| Se debe mostrar una página web como interfaz de entrada con un tour de las características o funcionalidades de la aplicación, mostrando todas las cualidades destacadas de la misma. Se incluyen páginas acerca de cada uno de los módulos que se gestionan y capturas de pantalla de las mismas.|
|**Roles**|Usuarios no registrados, administradores|
| **Prioridad del requerimiento:**|Muy Alta|

| **Identificación del requerimiento:** |NT-A3|
|---------------------------------------|-----|
| **Nombre del requerimiento:**|About de la aplicación|
| **Descripción del requerimiento:**| Se debe mostrar una página en la cual se hable del desarrollador, para qué sirve la página y por qué fue creada, además de dar créditos a algunas tecnologías y servicios utilizados por la aplicación.|
|**Roles**|Usuarios no registrados|
| **Prioridad del requerimiento:**|Muy Alta|

| **Identificación del requerimiento:** |NT-A4|
|---------------------------------------|-----|
| **Nombre del requerimiento:**|Perfil de usuario|
| **Descripción del requerimiento:**| Se debe mostrar una página donde esté la foto de perfil, el nombre de usuario, un _feed_ de los registros que haya hecho organizados en orden cronológico, además de contener una pestaña para ver las estadísticas.|
|**Roles**|Usuarios registrados, administradores|
| **Prioridad del requerimiento:**|Muy Alta|

| **Identificación del requerimiento:** |NT-A5|
|---------------------------------------|-----|
| **Nombre del requerimiento:**|Página de estadísticas|
| **Descripción del requerimiento:**| Se debe mostrar una página donde estén las estadísticas de velocidad de lectura, velocidad de lectura dividido por categorías, tiempo total de escucha, tiempo de escucha divido por categorías, cantidad total de caracteres leídos, cantidad de caracteres leídos dividos por distintos períodos (mes, semana, día), porcentaje de tipo de multimedia consumido en comparación al total, del usuario.|
|**Roles**|Usuarios registrados, administradores|
| **Prioridad del requerimiento:**|Muy Alta|

| **Identificación del requerimiento:** |NT-A6|
|---------------------------------------|-----|
| **Nombre del requerimiento:**|Feed de usuarios|
| **Descripción del requerimiento:**| Se debe mostrar una página donde estén las estadísticas de el usuario de velocidad de lectura, velocidad de lectura dividido por categorías, tiempo total de escucha, tiempo de escucha divido por categorías, cantidad total de caracteres leídos, cantidad de caracteres leídos dividos por distintos períodos (mes, semana, día), cantidad de caracteres leídos por tipo de inmersión, tiempo total de lectura, tiempo de lectura por tipo de multimedia, porcentaje de tipo de multimedia consumido en comparación al total.|
|**Roles**|Usuarios registrados, administradores|
| **Prioridad del requerimiento:**|Muy Alta|

| **Identificación del requerimiento:** |NT-A7|
|---------------------------------------|-----|
| **Nombre del requerimiento:**|Página de configuración|
| **Descripción del requerimiento:**| Se debe mostrar una página donde estén las configuraciones de cada usuario, como el tema de su perfil, el nombre de usuario, opciones de privacidad de registro de inmersión|
|**Roles**|Usuarios registrados, administradores|
| **Prioridad del requerimiento:**|Muy Alta|

### B) Autenticación de usuarios

| **Identificación del requerimiento:** |NT-B1|
|---------------------------------------|-----|
| **Nombre del requerimiento:**|Registro de usuario|
| **Descripción del requerimiento:**| El usuario debe ser capaz de registrarse con su cuenta de Google aunque sea un usuario nuevo.|
|**Roles**|Usuarios no registrados|
| **Prioridad del requerimiento:**|Muy Alta|
