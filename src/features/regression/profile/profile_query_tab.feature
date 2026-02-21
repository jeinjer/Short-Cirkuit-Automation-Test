@regression @p2 @ui @auth_client
Feature: Perfil - Navegación por Query

  Scenario: Cliente abre consultas por query param
    Given navego a la ruta pública "/perfil?tab=consultas"
    Then veo el perfil cargado
    Then veo la sección "Mis consultas"
