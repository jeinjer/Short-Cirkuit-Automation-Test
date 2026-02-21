@regression @p1 @ui
Feature: Ruteo - Not Found

  Scenario: Ruta inexistente muestra estado 404
    Given navego a la ruta pública "/qa-ruta-inexistente-e2e"
    Then veo página 404 o mensaje de no encontrado
