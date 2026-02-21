@regression @p0 @ui
Feature: Seguridad - Checkout

  Scenario: Invitado no puede acceder a checkout
    Given navego a checkout como invitado
    Then se bloquea el acceso al checkout