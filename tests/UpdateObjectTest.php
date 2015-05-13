<?php
class UpdateObjectTest extends PHPUnit_Framework_TestCase
{

    private $coreName = 'phpunittest';
    private $coreUrl = 'https://dev-u1.casebox.org/phpunittest/';
    private $cookieFile = 'cookies.txt';


    public function testPushAndPop()
    {
        // $this->prepareInstance();

        $this->getLoginKey();
        $this->login();

        $bool = $this->nodeExists(25170, false);
        $this->assertTrue($bool);

    }

    public function prepareInstance() {
        $p = ['dbUser' => 'local',
              'dbPass' => 'h0st',
              'dbName' => 'cb_' . $this->coreName,
              'sqlFile' => 'raw.sql'
        ];

        // import into MySql
        $cmd = 'mysql --user=' . $p['dbUser'] . ' --password=' . $p['dbPass'] . ' ' . $p['dbName'] . ' < ' . $p['sqlFile'];
        echo "\nsql: $cmd\n";
        exec($cmd);

        // drop SOLR core
        $url = 'http://localhost:8983/solr/admin/cores?action=UNLOAD&deleteInstanceDir=true&core=cb_' . $this->coreName;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        $output = curl_exec($ch);


        // create SOLR core
        $url = 'http://localhost:8983/solr/admin/cores?action=CREATE&configSet=cb_default&name=cb_' . $this->coreName;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        $output = curl_exec($ch);

        //
        $cmd = 'php ../bin/solr_reindex_core.php -c ' . $this->coreName . ' -a -l > exec.txt';
        echo "\nreindex_core: $cmd\n";
        exec($cmd);

    }

    public function setDefaulCurlParams(&$ch) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        curl_setopt($ch, CURLOPT_COOKIEJAR, realpath($this->cookieFile));
        curl_setopt($ch, CURLOPT_COOKIEFILE, realpath($this->cookieFile));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    }

    public function nodeExists($id, $verbose = false)
    {
        $ch = curl_init();

        $q = '{"action":"CB_Objects","method":"getPluginsData","data":[{"id":"' . $id .
              '"}],"type":"rpc","tid":32}';

        curl_setopt($ch, CURLOPT_URL, $this->coreUrl . 'remote/router.php');
        // $this->setDefaulCurlParams($ch);

        curl_setopt($ch, CURLOPT_BINARYTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");


        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $q);

        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        curl_setopt($ch, CURLOPT_COOKIEJAR, realpath($this->cookieFile));
        curl_setopt($ch, CURLOPT_COOKIEFILE, realpath($this->cookieFile));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_VERBOSE, true);

        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($q))
        );

        // curl_setopt($ch, CURLOPT_POSTFIELDSIZE, strlen($q));
        $t = curl_exec($ch);
        //echo "nodeExists: " . $t . "\n\n";

        $d = json_decode($t, true);

        if ($verbose) {
            echo "Node Preview:";
            echo (print_r($d));
        }

        // var_dump($d);
        return (@$d['result']['data']['systemProperties']['data']['id'] == $id);
    }

    public function getLoginKey() {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->coreUrl . 'login/');
        $this->setDefaulCurlParams($ch);

        //return the transfer as a string
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_VERBOSE, 1);
        curl_setopt($ch, CURLOPT_HEADER, 1);

        // $output = curl_exec($ch);

        // echo "output: $output\n";
        // echo "-- curl info --------\n";
        //var_dump(curl_getinfo($ch));

        curl_close($ch);
    }

    public function login() {

        $fields = ['u' => 'root',
                   'p' => 'devel',
                   's' => 'Login'];

        // create curl resource
        $ch = curl_init();

        // set url
        curl_setopt($ch, CURLOPT_URL, $this->coreUrl . 'login/auth/');
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);

        curl_setopt ($ch, CURLOPT_COOKIEJAR, realpath($this->cookieFile));
        curl_setopt ($ch, CURLOPT_COOKIEFILE, realpath($this->cookieFile));

        //return the transfer as a string
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_VERBOSE, 1);
        curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
        curl_setopt($ch, CURLOPT_AUTOREFERER, true);

        // $output contains the output string
        $output = curl_exec($ch);

        // echo "Login: $output\n";
        // echo "-- </Login> --------\n";
        // var_dump(curl_getinfo($ch));
        // echo "----------------\n";

        // close curl resource to free up system resources
        curl_close($ch);

    }
}
?>