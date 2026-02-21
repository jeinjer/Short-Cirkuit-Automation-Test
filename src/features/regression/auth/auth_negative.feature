@regression @p1 @ui
Feature: Auth - Negativos

  Scenario: Login inválido no inicia sesión
    Given abro la página de login
    When inicio sesión con credenciales inválidas
    Then no debo ver el menú de usuario habilitado