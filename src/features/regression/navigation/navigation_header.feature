@regression @p1 @ui
Feature: Navegación - Header y Footer

  Scenario: Invitado puede ir a Catálogo desde Header
    Given estoy en la home
    When navego a "Catálogo" desde el header
    Then estoy en "/catalogo"

  @regression @p1 @ui @auth_client
  Scenario: Cliente puede ir a Perfil desde Header
    Given estoy en la home
    When navego a "Perfil" desde el header
    Then estoy en "/perfil"