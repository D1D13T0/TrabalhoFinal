import type { Aluno } from "@/models";
import { normalizar } from "@/utils/formatacao";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Button, List, Modal, Portal, Searchbar, Text, useTheme } from "react-native-paper";
import { AvatarAluno } from "./AvatarAluno";

interface Props {
  visivel: boolean;
  alunos: Aluno[];
  selecionadoId: number | null;
  onEscolher: (id: number) => void;
  onFechar: () => void;
}

// Janela modal com busca para escolher o aluno dono do treino.
export function SeletorAluno({ visivel, alunos, selecionadoId, onEscolher, onFechar }: Props) {
  const tema = useTheme();
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return termo ? alunos.filter((a) => normalizar(a.usuario.nome).includes(termo)) : alunos;
  }, [alunos, busca]);

  return (
    <Portal>
      <Modal visible={visivel} onDismiss={onFechar} contentContainerStyle={[styles.caixa, { backgroundColor: tema.colors.surface }]}>
        <Text variant="titleLarge" style={styles.titulo}>
          Escolher aluno
        </Text>
        <Searchbar placeholder="Buscar aluno" value={busca} onChangeText={setBusca} style={{ elevation: 0 }} />
        <FlatList
          data={filtrados}
          keyExtractor={(a) => String(a.id)}
          style={styles.lista}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum aluno encontrado.</Text>}
          renderItem={({ item }) => (
            <List.Item
              title={item.usuario.nome}
              description={`${item.plano.nome} • ${item.diasTreino.join(", ")}`}
              onPress={() => onEscolher(item.id)}
              left={() => <AvatarAluno nome={item.usuario.nome} foto={item.foto} tamanho={40} />}
              right={(props) => (item.id === selecionadoId ? <List.Icon {...props} icon="check" color={tema.colors.primary} /> : null)}
              style={styles.item}
            />
          )}
        />
        <Button onPress={onFechar}>Cancelar</Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  caixa: { margin: 20, borderRadius: 20, padding: 16, maxHeight: "80%", maxWidth: 520, width: "90%", alignSelf: "center" },
  titulo: { fontWeight: "700", marginBottom: 12 },
  lista: { marginVertical: 8 },
  item: { paddingLeft: 8 },
  vazio: { textAlign: "center", marginVertical: 24, opacity: 0.7 },
});
