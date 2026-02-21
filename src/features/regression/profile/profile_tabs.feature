@regression @p1 @ui @auth_client
Feature: Perfil - Tabs

  Scenario: Cliente navega tabs del perfil
    When abro mi perfil
    Then veo el perfil cargado
    When abro la sección "Mis pedidos"
    Then veo la sección "Mis pedidos"
    When abro la sección "Mis consultas"
    Then veo la sección "Mis consultas"