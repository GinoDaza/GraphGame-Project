import struct

class Alumno:
    next_del = 0

    def __init__(self, codigo, nombre, apellidos, carrera, ciclo, mensualidad):
        self.codigo = codigo
        self.nombre = nombre
        self.apellidos = apellidos
        self.carrera = carrera
        self.ciclo = ciclo
        self.mensualidad = mensualidad

class FixedRecord:
    FORMAT = '5s11s20s15sifi'
    RECORD_SIZE = struct.calcsize(FORMAT)
    num_reg = 0
    header = -1

    def __init__(self, filename, del_method):
        self.filename = filename
        self.del_method = del_method
        with open(self.filename, "r+b") as file:
            file.seek(0)
            data = file.read(4)

            if self.del_method == "MOVE_THE_LAST":
                if not data:
                    file.seek(0)
                    file.write(struct.pack("i", 0))
                else:
                    self.num_reg = struct.unpack("i", data)[0]
            elif self.del_method == "FREE_LIST":
                if not data:
                    file.seek(0)
                    file.write(struct.pack("i", -1))
                else:
                    self.header = struct.unpack("i", data)[0]


    def load(self):
        alumnos = []

        if self.del_method == "MOVE_THE_LAST":
            with open(self.filename, "rb") as file:
                for i in range(self.num_reg):
                    file.seek(i * self.RECORD_SIZE + 4)
                    data = file.read(self.RECORD_SIZE)
                    codigo, nombre, apellidos, carrera, ciclo, mensualidad, next_del = struct.unpack(self.FORMAT, data)
                    alumno = Alumno(codigo.decode(), nombre.decode(), apellidos.decode(), carrera.decode(), ciclo, mensualidad)
                    alumnos.append(alumno)
        return alumnos

    def add(self, record):
        with open(self.filename, "r+b") as file:
            if self.del_method == "MOVE_THE_LAST":
                print("writing in: ", self.num_reg * self.RECORD_SIZE + 4)
                file.seek(self.num_reg * self.RECORD_SIZE + 4)
                record = struct.pack(self.FORMAT, record.codigo.encode(), record.nombre.encode(), record.apellidos.encode(), record.carrera.encode(), record.ciclo, record.mensualidad, record.next_del)
                file.write(record)

                self.num_reg += 1
                file.seek(0)
                file.write(struct.pack("i", self.num_reg))
            elif self.del_method == "FREE_LIST":
                if self.header == -1:
                    file.seek(0, 2)
                    record = struct.pack(self.FORMAT, record.codigo.encode(), record.nombre.encode(), record.apellidos.encode(), record.carrera.encode(), record.ciclo, record.mensualidad, record.next_del)
                    file.write(record)
                else:




    def readRecord(self, pos):
        with open(self.filename, "rb") as file:
            file.seek(pos * self.RECORD_SIZE + 4)
            data = file.read(self.RECORD_SIZE)
            if not data:
                return None
            codigo, nombre, apellidos, carrera, ciclo, mensualidad, next_del = struct.unpack(self.FORMAT, data)

            if self.del_method == "FREE_LIST" and next_del != 0:
                return None

            alumno = Alumno(codigo.decode(), nombre.decode(), apellidos.decode(), carrera.decode(), ciclo, mensualidad)
            alumno.next_del = next_del
            return alumno


    def remove(self, pos):
        if self.del_method == "MOVE_THE_LAST":
            with open(self.filename, "r+b") as file:
                file.seek(self.num_reg * self.RECORD_SIZE + 4)
                data = file.read(self.RECORD_SIZE)
                file.seek(pos * self.RECORD_SIZE + 4)
                file.write(data)

                file.seek(0)
                data = file.read(4)
                num_reg = struct.unpack("i", data)[0]

                num_reg -= 1
                self.num_reg = num_reg

                file.seek(0)
                file.write(struct.pack("i", num_reg))

        elif self.del_method == "FREE_LIST":
            with open(self.filename, "r+b") as file:
                file.seek(pos * self.RECORD_SIZE + 4 + struct.calcsize("5s11s20s15sif"))
                file.write(struct.pack("i", self.header))

                self.header = pos + 1       


filename = "alumnos.dat"

# Agregar registros
a1 = Alumno("123", "Carlos", "Gomez Sanchez", "CS", 4, 2000.20)
a2 = Alumno("321", "John", "Doe Doe", "DS", 5, 33.33)
a3 = Alumno("521", "Gino", "Daza Yalta", "Mecatronica", 2, 123.45)

alumnos = FixedRecord("alumnos.dat", "MOVE_THE_LAST")

# alumnos.remove(0)

# test = alumnos.readRecord(0)

# print(test.codigo, test.nombre, test.apellidos, test.carrera, test.ciclo, test.mensualidad)

# alumnos.add(a1)
# alumnos.add(a2)
# alumnos.add(a3)

all_alumnos = alumnos.load()

print(all_alumnos)

print("num_reg: ", alumnos.num_reg)