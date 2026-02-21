@regression @p2 @ui @auth_admin
Feature: Admin - Productos (Foto)

  Scenario: Admin puede cargar/editar foto de un producto si existe la acción
    Given abro el panel de admin
    When abro la pestaña "Productos"
    When abro editor de foto del primer producto si existe
    Then si hay input de archivo, puedo seleccionar una imagen y guardar
