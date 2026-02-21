@regression @p1 @ui @auth_client
Feature: Perfil - Datos básicos

  Scenario: Cliente ve datos básicos en su perfil
    When abro mi perfil
    Then veo el perfil cargado
    And veo nombre y email del usuario