window.addEventListener("load",cargarMaterias);

function $(id) {
    return document.getElementById(id);
  }


function cargarMaterias()
{
    var tabla=$("tabla");
    var peticion=new XMLHttpRequest();  
    peticion.open("GET","http://localhost:3000/materias",true);
    peticion.send();
    $("divModalBG").hidden=false; 
    $("divSpinner").hidden=false;

    peticion.onreadystatechange=function()
    {
        if(peticion.status== 200 && peticion.readyState == 4)
        {
            $("divModalBG").hidden=true;
            $("divSpinner").hidden=true;
            var arrayJson=JSON.parse(peticion.responseText);
     
            for (let index = 0; index < arrayJson.length; index++) 
            {
                crearRegistro(arrayJson[index],tabla);
            }
        }
    }
}


function crearRegistro(materia,tabla)
{

    var nombre=materia.nombre;
    var cuatrimestre=materia.cuatrimestre;
    var fechaFinal=materia.fechaFinal;
    var turno=materia.turno;
    var id=materia.id;


    var nuevaFila=document.createElement("tr");

    var tdId=document.createElement("td");
    var tdNombre=document.createElement("td");
    var tdCuatrimestre=document.createElement("td");
    var tdFecha=document.createElement("td");
    var tdTurno=document.createElement("td");
    
    var textoId=document.createTextNode(id);
    var textoNombre=document.createTextNode(nombre);
    var textoCuatrimestre=document.createTextNode(cuatrimestre);
    var textoFecha=document.createTextNode(fechaFinal);
    var textoTurno=document.createTextNode(turno);

    tdId.appendChild(textoId);
    tdNombre.appendChild(textoNombre);
    tdCuatrimestre.appendChild(textoCuatrimestre);
    tdFecha.appendChild(textoFecha);
    tdTurno.appendChild(textoTurno);

    tdId.style="display:none;";
    nuevaFila.appendChild(tdNombre);
    nuevaFila.appendChild(tdCuatrimestre);
    nuevaFila.appendChild(tdFecha);
    nuevaFila.appendChild(tdTurno);
    nuevaFila.appendChild(tdId);


    nuevaFila.addEventListener("dblclick",registrarFila);

    tabla.appendChild(nuevaFila);
}



function registrarFila(e)
{
    var divMateria=$("divMateria");

    $("divModalBG").hidden=false;
    divMateria.hidden=false;

    var tabla=$("tabla");
    var fila=e.target.parentNode; //obtengo fila

    var nombre=fila.childNodes[0].childNodes[0].nodeValue;
    var cuatrimestre=fila.childNodes[1].childNodes[0].nodeValue;
    var fechaCruda = fila.childNodes[2].childNodes[0].nodeValue;
    var dia = fechaCruda.substring(0,2);
    var mes = fechaCruda.substring(3,5);
    var año = fechaCruda.substring(6);
    var fechaFinal = new Date(parseInt(año),parseInt(mes)-1,parseInt(dia));

    var turno=fila.childNodes[3].childNodes[0].nodeValue;
    var id=fila.childNodes[4].childNodes[0].nodeValue;

    $("txtNombre").value=nombre;
    $("intCuatrimestre").value=cuatrimestre;
    $("fecFecha").value = formatDate(fechaFinal,"US");
    $("optManana").checked = (turno == "Mañana");
    $("optNoche").checked = (turno == "Noche");

    $("btnCerrar").onclick=function()
    {
        divMateria.hidden=true;
        $("divModalBG").hidden=true;
    }

    $("btnModificar").onclick=function()
    {
       
        var flagNombre=true;
        var flagFecha=true;
        var flagTurno=true;
       
        if($("txtNombre").value.length <= 6)
        {
            $("txtNombre").style.border = '1px solid red';          
            flagNombre=false;
        }
        else
        {
            $("txtNombre").style.border = '1px solid #033d64'; 
        }

        if(!($("optManana").checked || $("optNoche").checked))
        {
            $("optManana").style.border = '1px solid red';
            $("optNoche").style.border = '1px solid red'; 
            flagTurno=false;
        }
        else
        {
            $("optManana").style.border = '1px solid #033d64';
            $("optNoche").style.border = '1px solid #033d64';
        }

        var fechaInput=new Date($("fecFecha").value);
        fechaInput.setDate(fechaInput.getDate() + 1);

        var fechaActual=new Date();

        

        if(fechaInput < fechaActual)
        {
            $("fecFecha").style.borderColor="red";
            flagFecha=false;
        }
        else
        {
            $("fecFecha").style.border = '1px solid #033d64';
        }
    
        if(flagNombre && flagFecha && flagTurno)
        {
            var nombreInput= $("txtNombre").value;
            var cuatrimestreInput= $("intCuatrimestre").value;
            var turnoInput="Mañana";

            if($("optNoche").cheked)
            {
                turnoInput="Noche";
            }

            var jsonMateria={"id":id,"nombre":nombreInput,"cuatrimestre":cuatrimestreInput,"fechaFinal":formatDate(fechaInput),"turno":turnoInput}


            var peticion=new XMLHttpRequest();
            peticion.open("POST","http://localhost:3000/editar");
            peticion.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            peticion.send(JSON.stringify(jsonMateria));
            
            divMateria.hidden=true;
            $("divSpinner").hidden=false;

            peticion.onreadystatechange= function() 
            {
                if(peticion.status == 200 && peticion.readyState == 4)
                {
                    $("divModalBG").hidden=true;
                    $("divSpinner").hidden=true;

                    fila.childNodes[0].childNodes[0].nodeValue=nombreInput;
                    fila.childNodes[1].childNodes[0].nodeValue=cuatrimestreInput;
                    fila.childNodes[2].childNodes[0].nodeValue=formatDate(fechaInput);
                    fila.childNodes[3].childNodes[0].nodeValue=turno;
                }
            }
        }
    }

    $("btnEliminar").onclick=function()
    {
        var jsonMateria={"nombre":nombre,"cuatrimestre":cuatrimestre,"fechaFinal":fechaFinal,"turno":turno,"id":id}
        var peticion=new XMLHttpRequest();
        peticion.open("POST","http://localhost:3000/eliminar");
        peticion.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        peticion.send(JSON.stringify(jsonMateria));
        divMateria.hidden=true;

        $("divModalBG").hidden=false;
        $("divSpinner").hidden=false;

        peticion.onreadystatechange= function() 
        {                
            if(peticion.status == 200 && peticion.readyState == 4)
            {
                $("divModalBG").hidden=true;
                $("divSpinner").hidden=true;
                if(peticion.response == '{"type":"ok"}')
                {
                    tabla.removeChild(fila);
                }
                else
                {
                    alert("Se produjo un error");
                }
            }
        }
    }

}

function formatDate(date, type) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    if (type == "US")
    {
        return [year, month, day].join('-');
    }
    else
    {
        return [day, month, year].join('/');
    }
    
}