@regression @p2 @ui
Feature: Catálogo - Empty Search

  Scenario: Búsqueda sin resultados muestra empty state
    Given abro el catálogo
    When busco un término inexistente desde el header
    Then veo empty state de búsqueda en catálogo
