// Enum igual ao do Java
import { Medida } from './enum'
import { CulturaDTO } from './cultura'
import { OperacaoDTO } from './operacao'
import { ColaboradorDTO } from './colaborador'
import { SensorDTO } from './sensor'

export interface TalhaoRequestDTO {
    nome: string;
    descricao: string;
    tamanho: number;
    idUsuario: string;
    medida: Medida;
    idsCulturas: string[];
    idsOperacoes: string[];
    idsColaboradores: string[];
}

export interface TalhaoResponseDTO {
    id: string;
    nome: string;
    descricao: string;
    tamanho: number;
    medida: Medida;
    nomeResponsavel: string;
    nomesCulturas: string[];
    descricoesOperacoes: string[];
    ativo: boolean;
}

export interface TalhaoDetalhadoDTO {
    id: string;
    nome: string;
    descricao: string;
    tamanho: number;
    medida: Medida;
    ativo: boolean;
    culturas: CulturaDTO[];
    operacoes: OperacaoDTO[];
    colaboradores: ColaboradorDTO[];
    sensorTemperatura?: SensorDTO;
    sensorUmidade?: SensorDTO;
}