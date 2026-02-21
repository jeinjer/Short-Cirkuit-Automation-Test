@regression @p1 @ui
Feature: Catálogo - Orden

  Scenario: Ordenar catálogo por Nombre A - Z
    Given abro el catálogo
    When ordeno el catálogo por "Nombre A - Z"
    Then los nombres de productos están ordenados ascendente