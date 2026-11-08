import { AvatarAluno } from "@/components/AvatarAluno";
import { useAuth } from "@/contexts/AuthContext";
import { useMensagem } from "@/contexts/MensagemContext";
import { criarTreinoLocalDAO } from "@/database/TreinoLocalDAO";
import type { Aluno } from "@/models";
import { alunoAreaService } from "@/services/alunoAreaService";
import { formatarMoeda } from "@/utils/formatacao";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Divider, List, Portal, Surface, Text, useTheme } from "react-native-paper";

export default function PerfilScreen() {
  const { usuario, sair } = useAuth();
  const { mostrarMensagem } = useMensagem();
  const db = useSQLiteContext();
  const tema = useTheme();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);

  useFocusEffect(
    useCallback(() => {
      alunoAreaService.perfil().then(setAluno).catch(() => setAluno(null));
    }, []),
  );

  async function limparDadosOffline() {
    await criarTreinoLocalDAO(db).limpar(usuario?.alunoId ?? 0);
    setConfirmarLimpeza(false);
    mostrarMensagem("Cópia local apagada. Os treinos serão baixados de novo.", "info");
  }

  return (
    <ScrollView style={{ backgroundColor: tema.colors.background }} contentContainerStyle={styles.conteudo}>
      <View style={styles.topo}>
        <AvatarAluno nome={usuario?.nome ?? ""} foto={aluno?.foto} tamanho={96} />
        <Text variant="titleLarge" style={{ fontWeight: "700" }}>
          {usuario?.nome}
        </Text>
        <Text variant="bodyMedium" style={{ color: tema.colors.onSurfaceVariant }}>
          {usuario?.email}
        </Text>
      </View>

      {aluno && (
        <Surface style={styles.secao} elevation={1}>
          <List.Item title="Plano" description={`${aluno.plano.nome} • ${formatarMoeda(aluno.plano.valor)}/mês`} left={(p) => <List.Icon {...p} icon="card-account-details-outline" />} />
          <Divider />
          <List.Item title="Dias de treino" description={aluno.diasTreino.join(", ")} left={(p) => <List.Icon {...p} icon="calendar-week" />} />
          <Divider />
          <List.Item title="Vencimento" description={`Todo dia ${aluno.diaVencimento}`} left={(p) => <List.Icon {...p} icon="calendar-clock" />} />
          <Divider />
          <List.Item title="Telefone" description={aluno.telefone} left={(p) => <List.Icon {...p} icon="phone" />} />
        </Surface>
      )}

      <Surface style={styles.secao} elevation={1}>
        <List.Item
          title="Limpar dados offline"
          description="Apaga a cópia dos treinos salva neste celular"
          left={(p) => <List.Icon {...p} icon="database-remove-outline" />}
          onPress={() => setConfirmarLimpeza(true)}
        />
      </Surface>

      <Button mode="outlined" icon="logout" onPress={sair} textColor={tema.colors.error}>
        Sair
      </Button>

      <Portal>
        <Dialog visible={confirmarLimpeza} onDismiss={() => setConfirmarLimpeza(false)}>
          <Dialog.Title>Limpar dados offline?</Dialog.Title>
          <Dialog.Content>
            <Text>A cópia local dos treinos e as marcações de exercícios feitos serão apagadas deste celular.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {[
              <Button key="cancelar" onPress={() => setConfirmarLimpeza(false)}>
                Cancelar
              </Button>,
              <Button key="limpar" mode="contained" buttonColor={tema.colors.error} onPress={limparDadosOffline}>
                Limpar
              </Button>,
            ]}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 16, maxWidth: 720, width: "100%", alignSelf: "center" },
  topo: { alignItems: "center", gap: 4, marginTop: 8 },
  secao: { borderRadius: 16, overflow: "hidden" },
});
