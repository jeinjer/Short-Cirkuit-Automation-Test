@regression @p1 @ui
Feature: Header - Búsqueda

  Scenario: Buscar producto desde header abre catálogo con resultados
    Given abro el catálogo
    And guardo un término de búsqueda a partir del primer producto
    When busco el término desde el header
    Then la URL del catálogo contiene "search="
    And veo resultados que contienen el término