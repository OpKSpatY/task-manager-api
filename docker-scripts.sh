#!/bin/bash

# Script para gerenciar o banco de dados Docker

case "$1" in
    "start")
        echo "Iniciando banco de dados PostgreSQL..."
        docker-compose up -d
        echo "Banco iniciado! Use as credenciais: admin/root"
        ;;
    "stop")
        echo "Parando banco de dados..."
        docker-compose down
        echo "Banco parado!"
        ;;
    "restart")
        echo "Reiniciando banco de dados..."
        docker-compose down
        docker-compose up -d
        echo "Banco reiniciado!"
        ;;
    "status")
        echo "Status dos containers:"
        docker-compose ps
        ;;
    "logs")
        echo "Logs do PostgreSQL:"
        docker-compose logs postgres
        ;;
    "reset")
        echo "ATENÇÃO: Isso vai apagar todos os dados!"
        read -p "Tem certeza? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            docker-compose up -d
            echo "Banco resetado!"
        else
            echo "Operação cancelada."
        fi
        ;;
    "cleanup")
        echo "Limpando cache do Docker..."
        docker-compose down -v
        docker system prune -f
        docker-compose up -d
        echo "Limpeza concluída!"
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs|reset|cleanup}"
        echo ""
        echo "Comandos:"
        echo "  start   - Inicia o banco de dados"
        echo "  stop    - Para o banco de dados"
        echo "  restart - Reinicia o banco de dados"
        echo "  status  - Mostra o status dos containers"
        echo "  logs    - Mostra os logs do PostgreSQL"
        echo "  reset   - Reseta o banco (apaga todos os dados)"
        echo "  cleanup - Limpa cache do Docker e reinicia"
        exit 1
        ;;
esac
