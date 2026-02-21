@smoke @p0 @ui
Feature: Smoke - Home

  Scenario: Home carga y muestra catálogo al final
    Given que abro la home
    Then veo los elementos principales del home
    And veo un listado de productos al final