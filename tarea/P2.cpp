#include <iostream>
#include <fstream>

using  namespace std;

// Se debe implementar un programa para leer y escribir registros de longitud variable en un 
// archivo binario usando el tamaño del dato como separador.

class Matricula{
public:
    string codigo;
    int ciclo;
    float mensualidad;
    string observaciones;

    Matricula(string _codigo, int _ciclo, float _mensualidad, string _observaciones){
        codigo = _codigo;
        ciclo = _ciclo;
        mensualidad = _mensualidad;
        observaciones = _observaciones;
    }

    Matricula(){}
};

class RegistroBinario{
private:
    string filename;
    string metadata;
public:

    RegistroBinario(string _filename, string _metadata){
        filename = _filename;
        metadata = _metadata;
    }

    void add(const Matricula& record) {
        ofstream file(filename, ios::binary | ios::app);
        ofstream meta(metadata, ios::app);
    
        if (!file || !meta) {
            cerr << "Error al abrir los archivos.\n";
            return;
        }
    
        // Obtener la posición actual en el archivo binario
        file.seekp(0, ios::end);
        size_t pos = file.tellp();
    
        // Guardar el código (tamaño + contenido)
        size_t size = record.codigo.size();
        file.write(reinterpret_cast<const char*>(&size), sizeof(size_t));
        file.write(record.codigo.c_str(), size);
    
        // Guardar el ciclo (entero)
        file.write(reinterpret_cast<const char*>(&record.ciclo), sizeof(int));
    
        // Guardar la mensualidad (float)
        file.write(reinterpret_cast<const char*>(&record.mensualidad), sizeof(float));
    
        // Guardar las observaciones (tamaño + contenido)
        size = record.observaciones.size();
        file.write(reinterpret_cast<const char*>(&size), sizeof(size_t));
        file.write(record.observaciones.c_str(), size);
    
        // Escribir un salto de línea como separador visual (opcional en binario)
        char newline = '\n';
        file.write(&newline, 1);
    
        // Calcular el tamaño del registro y guardarlo en metadata
        size_t record_size = file.tellp() - pos;
        meta << pos << " " << record_size << "\n";
    
        file.close();
        meta.close();
    }
    

    Matricula readRecord(int pos){
        ifstream file(filename, ios::binary);
        Matricula record;
        return record;
    }

    void load(){

    }

    void remove(int pos){

    }
};

int main(){
    Matricula m1("202310505", 5, 2500.0, "zxcvbn");
    Matricula m2("202310321", 5, 2700.0, "qwerty");
    Matricula m3("202210123", 5, 2800.0, "asdfgh");

    RegistroBinario registro("matriculas.dat", "matriculas_md.dat");

    registro.add(m1);

}