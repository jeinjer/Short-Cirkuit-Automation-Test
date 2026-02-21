@regression @ui @auth_admin
Feature: Admin - Productos

  @p0
  Scenario: Admin ve listado de productos
    Given abro el panel de admin
    When abro la pestaña "Productos"
    Then veo el listado de productos o un empty state en Productos

  @p1
  Scenario: Admin puede abrir edición del primer producto si existe acción
    Given abro el panel de admin
    When abro la pestaña "Productos"
    And abro edición del primer producto si existe
    Then veo un modal o pantalla de edición de producto

  @p1
  Scenario: Admin puede activar/desactivar un producto si existe la acción
    Given abro el panel de admin
    When abro la pestaña "Productos"
    Then veo el listado de productos o un empty state en Productos
    When alterno el estado activo del primer producto si existe
    Then veo confirmación de cambio de estado
