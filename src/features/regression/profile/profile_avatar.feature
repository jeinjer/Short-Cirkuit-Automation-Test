@regression @p2 @ui @auth_client
Feature: Perfil - Avatar

  Scenario: Cliente puede guardar y quitar avatar
    When abro mi perfil
    Then veo el perfil cargado
    When selecciono un avatar disponible
    And guardo cambios de perfil
    Then veo confirmación de perfil actualizado
    When quito el avatar del perfil
    Then veo confirmación de avatar eliminado
