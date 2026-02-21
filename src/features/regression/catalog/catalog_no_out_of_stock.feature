@regression @p1 @ui
Feature: Catálogo - Sin stock

  Scenario: Invitado no ve productos sin stock en el catálogo
    Given abro el catálogo
    Then no veo productos marcados como "Sin stock"