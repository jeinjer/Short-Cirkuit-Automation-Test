@regression @p0 @ui @auth_client
Feature: Logout

  Scenario: Cerrar sesión
    Given estoy en la home
    When cierro sesión
    Then no debo ver el menú de usuario habilitado