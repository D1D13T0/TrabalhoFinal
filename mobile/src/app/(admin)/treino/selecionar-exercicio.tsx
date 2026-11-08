import { useMensagem } from "@/contexts/MensagemContext";
import type { Exercicio } from "@/models";
import { urlImagem } from "@/services/api";
import { exercicioService, GRUPOS_MUSCULARES, rotuloGrupo } from "@/services/exercicioService";
import { selecaoExercicio } from "@/services/selecaoExercicio";
import { normalizar } from "@/utils/formatacao";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Chip, Icon, List, Searchbar, Text, useTheme } from "react-native-paper";

// Página modal (ContentPage Modal Navigation): escolhe um exercício para adicionar ao treino.
export default function SelecionarExercicioModal() {
  const tema = useTheme();
  const { mostrarMensagem } = useMensagem();
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState<string | null>(null);
  const jaAdicionados = selecaoExercicio.jaAdicionados();

  useEffect(() => {
    exercicioService
      .listar()
      .then((lista) => setExercicios(lista.filter((e) => e.ativo)))
      .catch((e) => mostrarMensagem(e instanceof Error ? e.message : "Erro ao carregar exercícios.", "erro"))
      .finally(() => setCarregando(false));
    return () => selecaoExercicio.cancelar();
  }, [mostrarMensagem]);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return exercicios.filter(
      (e) =>
        (!grupo || e.grupoMuscular === grupo) &&
        (!termo || normalizar(`${e.nome} ${rotuloGrupo(e.grupoMuscular)}`).includes(termo)),
    );
  }, [exercicios, busca, grupo]);

  function escolher(exercicio: Exercicio) {
    selecaoExercicio.escolher(exercicio);
    router.back();
  }

  return (
    <View style={[styles.tela, { backgroundColor: tema.colors.background }]}>
      <View style={styles.filtros}>
        <Searchbar placeholder="Buscar exercício" value={busca} onChangeText={setBusca} autoFocus style={{ elevation: 0 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grupos}>
          {GRUPOS_MUSCULARES.map((g) => (
            <Chip
              key={g.valor}
              selected={grupo === g.valor}
              showSelectedOverlay
              mode={grupo === g.valor ? "flat" : "outlined"}
              onPress={() => setGrupo((atual) => (atual === g.valor ? null : g.valor))}
            >
              {g.rotulo}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {carregando ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(e) => String(e.id)}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum exercício encontrado.</Text>}
          renderItem={({ item }) => {
            const imagem = urlImagem(item.imagem);
            const adicionado = jaAdicionados.includes(item.id);
            return (
              <List.Item
                title={item.nome}
                description={adicionado ? `${rotuloGrupo(item.grupoMuscular)} • já está no treino` : rotuloGrupo(item.grupoMuscular)}
                onPress={() => escolher(item)}
                left={() => (
                  <View style={styles.esquerda}>
                    {imagem ? (
                      <Image source={{ uri: imagem }} style={styles.miniatura} />
                    ) : (
                      <Avatar.Icon size={44} icon="dumbbell" style={{ backgroundColor: tema.colors.primaryContainer }} color={tema.colors.onPrimaryContainer} />
                    )}
                  </View>
                )}
                right={() => (
                  <View style={styles.direita}>
                    <Icon source={adicionado ? "check-circle" : "plus-circle-outline"} size={24} color={tema.colors.primary} />
                  </View>
                )}
              />
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  filtros: { padding: 16, gap: 10 },
  grupos: { gap: 8 },
  esquerda: { justifyContent: "center", paddingLeft: 8 },
  direita: { justifyContent: "center" },
  miniatura: { width: 44, height: 44, borderRadius: 8 },
  vazio: { textAlign: "center", marginTop: 32, opacity: 0.7 },
});
