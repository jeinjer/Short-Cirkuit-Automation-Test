@regression @p0 @ui
Feature: Seguridad - Admin

  Scenario: Invitado no puede acceder a admin
    Given navego a admin como invitado
    Then se bloquea el acceso al admin