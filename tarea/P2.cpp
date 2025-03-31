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

   // Funcion auxiliar para escribir strings con su longitud (primero la longitud)
    void writeString(ofstream& file, const string& str) {
        size_t length = str.size();
        file.write(reinterpret_cast<const char*>(&length), sizeof(length));
        file.write(str.c_str(), length);
    }
    
public:

    RegistroBinario(string _filename, string _metadata){
        filename = _filename;
        metadata = _metadata;
    }

    // Aun no se si esta bien
    void add(const Matricula& record) {
        ofstream file(filename, ios::binary | ios::app);
        ofstream meta(metadata, ios::app);
        
        // Guardamos la posición del cursor en datos
        streampos pos = file.tellp();
        meta.write(reinterpret_cast<const char*>(&pos), sizeof(pos));

        // Escribimos cada campo con su tamaño cuando es tex
        writeString(file, record.codigo);
        file.write(reinterpret_cast<const char*>(&record.ciclo), sizeof(record.ciclo));
        file.write(reinterpret_cast<const char*>(&record.mensualidad), sizeof(record.mensualidad));
        writeString(file, record.observaciones);

        // Calculamos el tamaño total del registro
        size_t record_size = sizeof(size_t) + record.codigo.size() + 
                            sizeof(record.ciclo) + 
                            sizeof(record.mensualidad) + 
                            sizeof(size_t) + record.observaciones.size();

        // Guardamos el tamaño en el metadata
        meta.write(reinterpret_cast<const char*>(&record_size), sizeof(record_size));

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
