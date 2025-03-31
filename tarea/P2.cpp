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

    void print_data(){
        cout << "Codigo: " << codigo << " | Ciclo: " << ciclo << " | Mensualidad: " << mensualidad << " | Observaciones: " << observaciones << endl;  
    }
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
        ofstream file(filename, ios::binary | ios::ate | ios::app);
        ofstream meta(metadata, ios::binary | ios::ate | ios::app);
        
        // Guardamos la posición del cursor en metadatos
        streampos pos = file.tellp();
        cout << pos << endl;
        meta.write(reinterpret_cast<const char*>(&pos), sizeof(pos));

        // Escribimos cada campo con su tamaño cuando es texto
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
        // Abrimos el registro junto a su metadata
        ifstream file(filename, ios::binary | ios::in);
        ifstream meta(metadata, ios::binary | ios::in);

        // Buscamos la posicion del registro deseado en la metadata
        meta.seekg((sizeof(streampos) + sizeof(size_t)) * pos, ios::beg);

        streampos record_pos;
        meta.read(reinterpret_cast<char*>(&record_pos), sizeof(record_pos));
        cout << record_pos << endl;
        
        // Buscamos el tamaño del registro deseado en la metadata
        size_t record_size;
        meta.read(reinterpret_cast<char*>(&record_size), sizeof(record_size));

        // Buscamos y leemos el registro de acuerdo a su posicion y tamaño
        string codigo, observaciones;
        int ciclo; float mensualidad;
        size_t string_size;

        file.seekg(record_pos, ios::beg);

        file.read(reinterpret_cast<char*>(&string_size), sizeof(string_size));
        codigo.resize(string_size);
        file.read(&codigo[0], string_size);

        file.read(reinterpret_cast<char*>(&ciclo), sizeof(ciclo));

        file.read(reinterpret_cast<char*>(&mensualidad), sizeof(mensualidad));

        file.read(reinterpret_cast<char*>(&string_size), sizeof(string_size));
        observaciones.resize(string_size);
        file.read(&observaciones[0], string_size);

        meta.close();
        file.close();

        return Matricula(codigo, ciclo, mensualidad, observaciones);;
    }

    void load(){

    }

    void remove(int pos){

    }
};

int main(){

    Matricula m1("202310505", 4, 2500.0, "zxcvbn");
    Matricula m2("202310321", 5, 2700.0, "qwerty");
    Matricula m3("202210123", 6, 2800.0, "asdfgh");

    RegistroBinario registro("matriculas.dat", "metadata.dat");

    registro.add(m1);
    registro.add(m2);
    registro.add(m3);

    Matricula r1 = registro.readRecord(0);
    Matricula r2 = registro.readRecord(1);
    Matricula r3 = registro.readRecord(2);

    r1.print_data();
    r2.print_data();
    r3.print_data();

}
