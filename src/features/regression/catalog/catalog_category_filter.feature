@regression @p1 @ui
Feature: Catálogo - Filtros

  Scenario: Filtrar catálogo por categoría
    Given abro el catálogo
    When aplico el filtro de categoría "NOTEBOOKS"
    Then la URL del catálogo contiene "category=notebooks"
    And el título del catálogo muestra "notebooks"
    When borro todos los filtros del catálogo
    Then la URL del catálogo no contiene "category="