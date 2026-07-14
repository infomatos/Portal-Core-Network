import json
import os
import sys
import unicodedata
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_XLSX_PATH = BASE_DIR / "front" / "public" / "dados" / "demandas.xlsx"
XLSX_PATH = Path(os.environ.get("DEMANDAS_XLSX_PATH", DEFAULT_XLSX_PATH))


def normalizar_texto(valor):
    texto = "" if valor is None else str(valor).strip()
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(char for char in texto if unicodedata.category(char) != "Mn")
    return texto.replace("_", " ").replace("-", " ").lower().strip()


def valor_limpo(valor):
    if pd.isna(valor):
        return ""
    texto = str(valor).strip()
    return "" if texto.upper() == "NULL" else texto


def encontrar_coluna(df, nomes):
    nomes_normalizados = {normalizar_texto(nome) for nome in nomes}
    for coluna in df.columns:
      if normalizar_texto(coluna) in nomes_normalizados:
          return coluna
    return None


def carregar_demandas():
    if not XLSX_PATH.exists():
        raise FileNotFoundError(f"Planilha nao encontrada em {XLSX_PATH}")

    df = pd.read_excel(XLSX_PATH, sheet_name=0)

    colunas = {
        "id": encontrar_coluna(df, ["ticket_id", "id", "codigo", "numero", "demanda", "chamado"]),
        "status": encontrar_coluna(df, ["status_atual", "status", "situacao", "estado"]),
        "responsavel": encontrar_coluna(df, ["responsavel_atual", "responsavel", "owner", "focal", "analista"]),
        "criticidade": encontrar_coluna(df, ["criticidade", "prioridade", "severidade"]),
        "aging": encontrar_coluna(df, ["aging_dias", "aging dias", "aging"]),
        "ambiente": encontrar_coluna(df, ["ambiente", "area", "equipe", "gerencia", "squad"]),
        "tipo": encontrar_coluna(df, ["tipoDemanda", "tipo demanda", "titulo", "descricao", "assunto"]),
        "ano": encontrar_coluna(df, ["ano_criacao", "ano criacao", "ano"]),
    }

    if colunas["id"]:
        df = df[df[colunas["id"]].fillna("").astype(str).str.strip().str.upper().ne("NULL")]
        df = df[df[colunas["id"]].fillna("").astype(str).str.strip().ne("0")]

    for chave, coluna in colunas.items():
        if coluna and chave != "aging":
            df[coluna] = df[coluna].apply(valor_limpo)

    return df, colunas


def contar_por(df, coluna):
    if not coluna:
        return []
    serie = df[coluna].replace("", "Nao informado").fillna("Nao informado")
    return [
        {"nome": str(nome), "total": int(total)}
        for nome, total in serie.value_counts().head(8).items()
    ]


def formatar_contagem(itens):
    if not itens:
        return "Nao encontrei essa coluna na planilha."
    return "; ".join(f"{item['nome']}: {item['total']}" for item in itens)


def serie_ano(df, coluna):
    if not coluna:
        return None
    return pd.to_numeric(df[coluna], errors="coerce").dropna().astype(int)


def comparar_anos(df, colunas, anos):
    ano_col = colunas.get("ano")
    anos_serie = serie_ano(df, ano_col)
    if anos_serie is None:
        return {"resposta": "Nao encontrei a coluna de ano de criacao na planilha.", "dados": {}}

    totais = {ano: int((anos_serie == ano).sum()) for ano in anos}
    partes = [f"{ano}: {total}" for ano, total in totais.items()]

    if len(anos) == 2:
        ano_a, ano_b = anos
        diferenca = totais[ano_b] - totais[ano_a]
        if diferenca > 0:
            variacao = f"{ano_b} tem {diferenca} demandas a mais que {ano_a}"
        elif diferenca < 0:
            variacao = f"{ano_b} tem {abs(diferenca)} demandas a menos que {ano_a}"
        else:
            variacao = f"{ano_b} tem o mesmo volume de {ano_a}"

        return {
            "resposta": f"Comparativo {ano_a} x {ano_b}: {'; '.join(partes)}. {variacao}.",
            "dados": {"anos": totais, "diferenca": diferenca},
        }

    return {
        "resposta": f"Demandas nos anos solicitados: {'; '.join(partes)}.",
        "dados": {"anos": totais},
    }


def demandas_abertas(df, colunas):
    status_col = colunas.get("status")
    if not status_col:
        return df

    status = df[status_col].fillna("").astype(str).map(normalizar_texto)
    fechadas = status.str.contains("conclu|cancel|finaliz|fechad", regex=True)
    return df[~fechadas]


def demandas_fechadas(df, colunas):
    status_col = colunas.get("status")
    if not status_col:
        return df.iloc[0:0]

    status = df[status_col].fillna("").astype(str).map(normalizar_texto)
    fechadas = status.str.contains("conclu|cancel|finaliz|fechad", regex=True)
    return df[fechadas]


def responder(pergunta):
    df, colunas = carregar_demandas()
    pergunta_normalizada = normalizar_texto(pergunta)

    if any(termo in pergunta_normalizada for termo in ["total", "quantas demandas existem", "quantidade", "uteis", "existem"]):
        return {
            "resposta": f"Encontrei {len(df)} demandas uteis na planilha.",
            "dados": {"total": int(len(df))},
        }

    if any(termo in pergunta_normalizada for termo in ["status", "situacao", "estado", "distribuicao"]):
        itens = contar_por(df, colunas["status"])
        return {
            "resposta": f"Resumo por status: {formatar_contagem(itens)}.",
            "dados": {"status": itens},
        }

    if any(
        termo in pergunta_normalizada
        for termo in ["responsavel", "analista", "focal", "owner", "quem concentra", "concentra", "maior volume"]
    ):
        itens = contar_por(df, colunas["responsavel"])
        return {
            "resposta": f"Demandas por responsavel: {formatar_contagem(itens)}.",
            "dados": {"responsaveis": itens},
        }

    if any(termo in pergunta_normalizada for termo in ["criticidade", "prioridade", "critica", "severidade"]):
        itens = contar_por(df, colunas["criticidade"])
        return {
            "resposta": f"Demandas por criticidade: {formatar_contagem(itens)}.",
            "dados": {"criticidade": itens},
        }

    if any(termo in pergunta_normalizada for termo in ["ambiente", "area", "equipe"]):
        itens = contar_por(df, colunas["ambiente"])
        return {
            "resposta": f"Demandas por ambiente: {formatar_contagem(itens)}.",
            "dados": {"ambiente": itens},
        }

    if any(termo in pergunta_normalizada for termo in ["aging", "antig", "parad", "atras", "envelhec"]):
        aging_col = colunas["aging"]
        if not aging_col:
            return {"resposta": "Nao encontrei a coluna de aging na planilha.", "dados": {}}

        abertas = demandas_abertas(df, colunas).copy()
        abertas[aging_col] = pd.to_numeric(abertas[aging_col], errors="coerce").fillna(0)
        top = abertas.sort_values(aging_col, ascending=False).head(5)
        id_col = colunas["id"]
        resp_col = colunas["responsavel"]
        itens = []
        for _, linha in top.iterrows():
            responsavel = valor_limpo(linha[resp_col]) if resp_col else ""
            itens.append({
                "id": str(linha[id_col]) if id_col else "",
                "responsavel": responsavel or "Nao informado",
                "aging_dias": int(linha[aging_col]),
            })

        resumo = "; ".join(
            f"{item['id']} ({item['aging_dias']} dias, {item['responsavel']})"
            for item in itens
        )
        return {
            "resposta": f"Top demandas abertas com maior aging: {resumo}.",
            "dados": {"top_aging": itens},
        }

    if any(termo in pergunta_normalizada for termo in ["abert", "andamento", "pendente"]):
        abertas = demandas_abertas(df, colunas)
        fechadas = demandas_fechadas(df, colunas)
        return {
            "resposta": (
                f"Encontrei {len(abertas)} demandas nao finalizadas. "
                f"Como referencia, {len(fechadas)} aparecem como concluidas, canceladas ou fechadas."
            ),
            "dados": {"abertas": int(len(abertas)), "fechadas": int(len(fechadas))},
        }

    anos_solicitados = [ano for ano in [2025, 2026] if str(ano) in pergunta_normalizada]
    if len(anos_solicitados) >= 2:
        return comparar_anos(df, colunas, anos_solicitados)

    if any(termo in pergunta_normalizada for termo in ["ano", "compar"]):
        itens = contar_por(df, colunas["ano"])
        return {
            "resposta": f"Demandas por ano de criacao: {formatar_contagem(itens)}.",
            "dados": {"anos": itens},
        }

    return {
        "resposta": (
            "Nesta primeira versao em Python eu respondo sobre total, status, "
            "responsavel, criticidade, ambiente, aging e comparativo por ano."
        ),
        "dados": {"colunas_detectadas": colunas},
    }


def main():
    payload = json.loads(sys.stdin.read() or "{}")
    pergunta = str(payload.get("pergunta", "")).strip()

    if not pergunta:
        raise ValueError("Pergunta vazia.")

    resultado = responder(pergunta)
    print(json.dumps(resultado, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(json.dumps({"erro": str(exc)}, ensure_ascii=False))
        sys.exit(1)
