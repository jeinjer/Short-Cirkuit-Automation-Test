@smoke @p0 @ui
Feature: Smoke - Catálogo

  Scenario: Catálogo carga y lista al menos 1 producto
    Given abro el catálogo
    Then veo al menos 1 producto listado en el catálogo