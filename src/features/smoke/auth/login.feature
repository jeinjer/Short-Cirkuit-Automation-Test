@smoke @p0 @ui
Feature: Smoke - Login

  Scenario: Login cliente con credenciales válidas
    Given abro la página de login
    When inicio sesión como cliente
    Then veo el menú de usuario habilitado