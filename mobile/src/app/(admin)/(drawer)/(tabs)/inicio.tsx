import { AvatarAluno } from "@/components/AvatarAluno";
import type { NomeIcone } from "@/components/iconeNavegacao";
import { useAuth } from "@/contexts/AuthContext";
import type { SituacaoAluno } from "@/services/pagamentoService";
import { marca, statusCores } from "@/theme";
import { formatarMoeda, isoParaBr, nomeMes } from "@/utils/formatacao";
import { useDashboardViewModel } from "@/viewmodels/useDashboardViewModel";
import { router } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Icon, List, Surface, Text, useTheme } from "react-native-paper";

function CartaoNumero({ icone, titulo, valor, cor }: { icone: NomeIcone; titulo: string; valor: string; cor: string }) {
  const tema = useTheme();
  return (
    <Surface style={[styles.numero, { borderTopColor: cor }]} elevation={1}>
      <Icon source={icone} size={24} color={cor} />
      <Text variant="headlineSmall" style={{ fontWeight: "700" }} numberOfLines={1} adjustsFontSizeToFit>
        {valor}
      </Text>
      <Text variant="labelMedium" style={{ color: tema.colors.onSurfaceVariant }}>
        {titulo}
      </Text>
    </Surface>
  );
}

function ListaSituacao({ titulo, itens, cor, vazio }: { titulo: string; itens: SituacaoAluno[]; cor: string; vazio: string }) {
  const tema = useTheme();
  return (
    <Surface style={styles.secao} elevation={1}>
      <Text variant="titleSmall" style={[styles.tituloSecao, { color: cor }]}>
        {titulo} ({itens.length})
      </Text>
      {itens.length === 0 ? (
        <Text style={{ color: tema.colors.onSurfaceVariant, paddingVertical: 8 }}>{vazio}</Text>
      ) : (
        itens.map((s) => (
          <List.Item
            key={s.alunoId}
            title={s.nome}
            description={
              s.status === "ATRASADA"
                ? `${formatarMoeda(s.valor)} • ${Math.abs(s.diasParaVencer)} dia(s) de atraso`
                : `${formatarMoeda(s.valor)} • ${s.diasParaVencer === 0 ? "vence hoje" : `vence ${isoParaBr(s.vencimento).slice(0, 5)} (${s.diasParaVencer} dia(s))`}`
            }
            descriptionNumberOfLines={2}
            left={() => <AvatarAluno nome={s.nome} foto={s.foto} tamanho={40} />}
            right={() => (
              <Button
                compact
                mode="contained-tonal"
                onPress={() => router.push({ pathname: "/pagamento/novo", params: { alunoId: s.alunoId, mes: s.mesReferencia } })}
              >
                Receber
              </Button>
            )}
            style={styles.item}
          />
        ))
      )}
    </Surface>
  );
}

// Painel inicial do admin: números do mês, mensalidades atrasadas e a vencer.
export default function InicioAdminScreen() {
  const vm = useDashboardViewModel();
  const { usuario } = useAuth();
  const tema = useTheme();

  if (vm.carregando) return <ActivityIndicator style={{ marginTop: 48 }} />;
  const d = vm.dados;

  return (
    <ScrollView
      style={{ backgroundColor: tema.colors.background }}
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={vm.atualizando} onRefresh={vm.atualizar} />}
    >
      <Surface style={[styles.boasVindas, { backgroundColor: tema.dark ? tema.colors.surface : marca.azul }]} elevation={2}>
        <View style={{ flex: 1 }}>
          <Text variant="titleLarge" style={styles.textoClaro}>
            Olá, {usuario?.nome.split(" ")[0]}!
          </Text>
          <Text variant="bodyMedium" style={{ color: "#D3E4F5" }}>
            Resumo de {d ? nomeMes(d.mesReferencia) : "este mês"}
          </Text>
        </View>
        <Icon source="chart-box-outline" size={40} color={marca.branco} />
      </Surface>

      {d && (
        <>
          {/* Grid 2x2 de indicadores */}
          <View style={styles.grade}>
            <CartaoNumero icone="account-group" titulo="Alunos ativos" valor={String(d.alunosAtivos)} cor={tema.colors.primary} />
            <CartaoNumero icone="cash-check" titulo="Recebido no mês" valor={formatarMoeda(d.recebidoNoMes)} cor={statusCores.sucesso} />
            <CartaoNumero icone="alert-circle" titulo="Atrasados" valor={String(d.atrasados.length)} cor={statusCores.erro} />
            <CartaoNumero icone="calendar-alert" titulo="Vencem em 5 dias" valor={String(d.aVencer.length)} cor={statusCores.aviso} />
          </View>

          <ListaSituacao titulo="Mensalidades atrasadas" itens={d.atrasados} cor={statusCores.erro} vazio="Nenhuma mensalidade atrasada. 🎉" />
          <ListaSituacao titulo="Vencem nos próximos dias" itens={d.aVencer} cor={statusCores.aviso} vazio="Nenhuma mensalidade vencendo nos próximos dias." />
        </>
      )}

      <Text variant="titleSmall" style={[styles.tituloSecao, { color: tema.colors.primary }]}>
        Atalhos
      </Text>
      <View style={styles.atalhos}>
        <Button mode="outlined" icon="account-plus" onPress={() => router.push("/aluno/novo")} style={styles.atalho}>
          Novo aluno
        </Button>
        <Button mode="outlined" icon="clipboard-plus-outline" onPress={() => router.push("/treino/novo")} style={styles.atalho}>
          Novo treino
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 12, paddingBottom: 32, maxWidth: 720, width: "100%", alignSelf: "center" },
  boasVindas: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  textoClaro: { color: marca.branco, fontWeight: "700" },
  grade: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  numero: { flexBasis: "47%", flexGrow: 1, borderRadius: 14, padding: 14, gap: 4, borderTopWidth: 4 },
  secao: { borderRadius: 16, padding: 12 },
  tituloSecao: { fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  item: { paddingLeft: 0, paddingRight: 0 },
  atalhos: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  atalho: { flexGrow: 1 },
});
