@smoke @p0 @ui
Feature: Smoke - Producto

  Scenario: Abrir detalle de producto desde catálogo
    Given abro el catálogo
    When abro el primer producto del listado
    Then la página de producto está cargada