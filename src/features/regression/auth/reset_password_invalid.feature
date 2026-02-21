@regression @p1 @ui
Feature: Auth - Reset password

  Scenario: Token inválido muestra error o bloqueo
    Given abro reset password con token inválido
    Then veo error de token inválido o no puedo continuar