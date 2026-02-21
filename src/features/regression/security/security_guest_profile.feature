@regression @p0 @ui
Feature: Seguridad - Perfil

  Scenario: Invitado no puede acceder al perfil
    Given navego a perfil como invitado
    Then se bloquea el acceso al perfil
