<?php

require 'vendor/autoload.php';

class ObjectAPITest extends PHPUnit_Framework_TestCase
{

    private $CBloaded = 0;

    public function testRead()
    {
        $this->initCB();

        $id = 25170;
        $o = new \CB\Objects\Object();
        $o->load($id);
        $objData = $o->getData();
        $cData = $objData['data'];

        // print_r($cData);
        // check if custom fields loaded ok
        $bool = $cData['office'] == 24266;

        $this->assertTrue($bool);

    }

    public function testCreate()
    {
        $this->initCB();

        // creating an Action in "IACHR / Maria Claudia case"
        $o = new \CB\Objects\Object();
        $p = [
            'pid'          => 25139
            ,'template_id' => 24195
            ,'name'        => 'Test action'
            ,'date'        => '2015-01-01'
            ,'cdate'       => '2015-01-01'
        ];

        $data = [
            'office' => 24266
        ];

        $id = $o->create($p);

        $o->delete(false);
        $o->delete(true);

        $bool = $id > 0;

        /*
        $o = new \CB\Objects\Object();
        $o->load($id);

        $objData = $o->getData();
        $cData = $objData['data'];

        // print_r($cData);
        // check if custom fields loaded ok
        $bool = $cData['office'] == 24266;
        */
        $this->assertTrue($bool);
    }


    public function initCB() {

        if ($this->CBloaded) {
            return;
        }

        $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
        $_SERVER['SERVER_NAME'] = 'local.casebox.org';
        $_GET['core'] = 'phpunittest';
        $_SESSION['user'] = array('id' => 1);
        require_once '../httpsdocs/config.php';
        require_once '../httpsdocs/lib/language.php';
        // require_once '../../../lib/Util.php';
        \CB\L\initTranslations();
        \CB\Config::setEnvVar('user_language_index', 1);

        $this->CBloaded = 1;
    }


}
